import axios from 'axios';
import BooksModel from '../models/Book.js';

interface OpenLibraryDoc {
  key: string; // e.g., "/works/OL12345W"
  title: string;
  author_name?: string[];
  edition_key?: string[];
  cover_i?: number;
}

// -------------------- Helpers --------------------

// Fetch description + subjects from a Work
const fetchWorkDetails = async (olid: string, signal: AbortSignal) => {
  try {
    const res = await axios.get(`https://openlibrary.org/works/${olid}.json`, {
      signal,
    });
    const rawDescription = res.data.description;
    const description =
      typeof rawDescription === 'string'
        ? rawDescription
        : rawDescription?.value || '';
    const subjects = Array.isArray(res.data.subjects) ? res.data.subjects : [];
    return { description, subjects };
  } catch (err) {
    if ((err as Error).name === 'CanceledError') {
      console.log(`⚠️ Request for work ${olid} was cancelled`);
    } else {
      console.error(`❌ Failed to fetch work ${olid}:`, (err as Error).message);
    }
    return { description: '', subjects: [] };
  }
};

const fetchAllEditionIsbns = async (
  editionKeys: string[],
  signal: AbortSignal
) => {
  const allIsbns: string[] = [];
  for (const editionOlid of editionKeys) {
    try {
      const res = await axios.get(
        `https://openlibrary.org/books/${editionOlid}.json`,
        { signal }
      );
      if (Array.isArray(res.data.isbn_10)) allIsbns.push(...res.data.isbn_10);
      if (Array.isArray(res.data.isbn_13)) allIsbns.push(...res.data.isbn_13);
    } catch (err) {
      if ((err as Error).name === 'CanceledError') {
        console.log(`⚠️ Request for edition ${editionOlid} was cancelled`);
      } else {
        console.warn(
          `⚠️ Failed to fetch edition ${editionOlid}:`,
          (err as Error).message
        );
      }
    }
  }
  return Array.from(new Set(allIsbns));
};

// Check if title contains query in order
const titleMatchesQuery = (title: string, query: string) =>
  title.toLowerCase().includes(query.toLowerCase());

// -------------------- Main Function --------------------

let currentSearchController: AbortController | null = null;

const fetchBookIfNotFound = async (query: string) => {
  if (!query?.trim()) return null;

  // cancel previous search request
  if (currentSearchController) currentSearchController.abort();

  const searchController = new AbortController();
  currentSearchController = searchController;

  try {
    // check DB first
    const existingBook = await BooksModel.findOne({
      title: { $regex: new RegExp(query, 'i') },
    });
    if (existingBook) return existingBook;

    // main search request
    const searchRes = await axios.get(
      `https://openlibrary.org/search.json?q=${encodeURIComponent(
        query
      )}&limit=5`,
      { signal: searchController.signal }
    );

    const docs: OpenLibraryDoc[] = searchRes.data.docs;
    if (!docs?.length) return null;

    const doc = docs.find((d) => titleMatchesQuery(d.title, query));
    if (!doc) return null;

    const workOlid = doc.key.replace('/works/', '');
    const title = doc.title;
    const author_name = Array.isArray(doc.author_name)
      ? doc.author_name[0]
      : doc.author_name;
    const editionKeys = doc.edition_key || [];

    // ❌ Do NOT pass searchController.signal here
    const isbns = await fetchAllEditionIsbns(
      editionKeys,
      new AbortController().signal
    );
    const { description, subjects } = await fetchWorkDetails(
      workOlid,
      new AbortController().signal
    );

    const newBook = await BooksModel.findOneAndUpdate(
      { olid: workOlid },
      {
        $setOnInsert: {
          olid: workOlid,
          title,
          author_name,
          isbns,
          primaryEditionOlid: editionKeys[0] || '',
          cover_i: doc.cover_i || null,
          description,
          categories: subjects.slice(0, 5),
        },
      },
      { new: true, upsert: true }
    );

    return newBook;
  } catch (err) {
    if ((err as Error).name === 'CanceledError') {
      console.log(`⚠️ Request for "${query}" was cancelled`);
    } else {
      console.error(
        `❌ Failed to fetch/save book "${query}":`,
        (err as Error).message
      );
    }
    return null;
  } finally {
    // clear controller only if it’s the same request
    if (currentSearchController === searchController)
      currentSearchController = null;
  }
};

export default fetchBookIfNotFound;
