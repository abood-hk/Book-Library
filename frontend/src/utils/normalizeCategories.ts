export const GENRES = [
  'Fantasy',
  'Sociopath',
  'Sci-Fi',
  'Romance',
  'History',
  'Horror',
  'Fairy Tales',
  'Mystery',
  'Thriller',
  'Adventure',
  'Classics',
  'Murder',
  'Detective',
  'Poetry',
  'Drama',
  'Non-Fiction',
  'Biography',
  'Children',
  'Young Adult',
  'Fiction',
  'Magic',
  'Witches',
  'Paranormal',
  'Dystopian',
  'Mythology',
  'Religion',
  'Philosophy',
  'Politics',
  'Science',
  'Technology',
  'Self-Help',
  'Education',
  'Travel',
  'Cooking',
  'Art',
  'Music',
  'Sports',
  'True Crime',
  'Short Stories',
  'Graphic Novels',
  'Other',
] as const;

type Genre = (typeof GENRES)[number];

const uniqueCategories = (categories: string[]): Genre[] => {
  const genres: Set<Genre> = new Set();

  categories.forEach((rawcat) => {
    const cat = rawcat.toLowerCase();

    if (cat.includes('fantasy')) genres.add('Fantasy');
    else if (cat.includes('science fiction') || cat.includes('sci-fi'))
      genres.add('Sci-Fi');
    else if (cat.includes('romance') || cat.includes('love story'))
      genres.add('Romance');
    else if (cat.includes('history') || cat.includes('historical'))
      genres.add('History');
    else if (
      cat.includes('horror') ||
      cat.includes('ghost') ||
      cat.includes('supernatural')
    )
      genres.add('Horror');
    else if (cat.includes('murder')) genres.add('Murder');
    else if (cat.includes('sociopath') || cat.includes('psychopath'))
      genres.add('Sociopath');
    else if (
      cat.includes('fairy tale') ||
      cat.includes('folklore') ||
      cat.includes('myth')
    )
      genres.add('Fairy Tales');
    else if (cat.includes('detective')) genres.add('Detective');
    else if (cat.includes('mystery') || cat.includes('whodunit'))
      genres.add('Mystery');
    else if (
      cat.includes('thriller') ||
      cat.includes('suspense') ||
      cat.includes('crime')
    )
      genres.add('Thriller');
    else if (
      cat.includes('adventure') ||
      cat.includes('quest') ||
      cat.includes('exploration')
    )
      genres.add('Adventure');
    else if (cat.includes('classic') || cat.includes('literature'))
      genres.add('Classics');
    else if (cat.includes('poetry') || cat.includes('poem'))
      genres.add('Poetry');
    else if (
      cat.includes('drama') ||
      cat.includes('play') ||
      cat.includes('tragedy')
    )
      genres.add('Drama');
    else if (
      cat.includes('biography') ||
      cat.includes('memoir') ||
      cat.includes('autobiography')
    )
      genres.add('Biography');
    else if (cat.includes('witch') || cat.includes('witches'))
      genres.add('Witches');
    else if (
      cat.includes('children') ||
      cat.includes('kids') ||
      cat.includes('juvenile')
    )
      genres.add('Children');
    else if (cat.includes('young adult') || cat.includes('ya'))
      genres.add('Young Adult');
    else if (cat.includes('magic') || cat.includes('magical'))
      genres.add('Magic');
    else if (
      cat.includes('paranormal') ||
      cat.includes('vampire') ||
      cat.includes('werewolf')
    )
      genres.add('Paranormal');
    else if (cat.includes('dystopian') || cat.includes('post-apocalyptic'))
      genres.add('Dystopian');
    else if (
      cat.includes('mythology') ||
      cat.includes('greek myth') ||
      cat.includes('roman myth')
    )
      genres.add('Mythology');
    else if (cat.includes('religion') || cat.includes('spirituality'))
      genres.add('Religion');
    else if (cat.includes('philosophy')) genres.add('Philosophy');
    else if (cat.includes('politics') || cat.includes('government'))
      genres.add('Politics');
    else if (
      cat.includes('science') ||
      cat.includes('physics') ||
      cat.includes('biology')
    )
      genres.add('Science');
    else if (
      cat.includes('technology') ||
      cat.includes('computers') ||
      cat.includes('engineering')
    )
      genres.add('Technology');
    else if (cat.includes('self-help') || cat.includes('personal development'))
      genres.add('Self-Help');
    else if (cat.includes('education') || cat.includes('teaching'))
      genres.add('Education');
    else if (cat.includes('travel') || cat.includes('geography'))
      genres.add('Travel');
    else if (cat.includes('cooking') || cat.includes('food'))
      genres.add('Cooking');
    else if (
      cat.includes('art') ||
      cat.includes('painting') ||
      cat.includes('drawing')
    )
      genres.add('Art');
    else if (cat.includes('music') || cat.includes('song')) genres.add('Music');
    else if (cat.includes('sports') || cat.includes('athletics'))
      genres.add('Sports');
    else if (cat.includes('true crime')) genres.add('True Crime');
    else if (cat.includes('short story') || cat.includes('anthology'))
      genres.add('Short Stories');
    else if (
      cat.includes('graphic novel') ||
      cat.includes('comics') ||
      cat.includes('manga')
    )
      genres.add('Graphic Novels');
    else if (cat.includes('fiction')) genres.add('Fiction');
    else genres.add('Other');
  });

  if (genres.has('Other')) {
    genres.delete('Other');
    genres.add('Other');
  }

  return Array.from(genres);
};

export default uniqueCategories;
