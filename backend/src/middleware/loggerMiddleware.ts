import path from 'path';
import chalk from 'chalk';
import url from 'url';
import { Request, Response, NextFunction } from 'express';

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const parts = __dirname.split(path.sep);
const index = parts.indexOf('book-library');
const shortDirname = parts.slice(index).join(path.sep);

const colors: Record<Method, (_: string) => string> = {
  GET: chalk.green,
  POST: chalk.yellow,
  PUT: chalk.blue,
  DELETE: chalk.redBright,
};

const logger = (req: Request, res: Response, next: NextFunction) => {
  const method: Method = req.method as Method;
  console.log(
    colors[method](`${method}\t${path.join(shortDirname, '..', '..', req.url)}`)
  );
  next();
};

export default logger;
