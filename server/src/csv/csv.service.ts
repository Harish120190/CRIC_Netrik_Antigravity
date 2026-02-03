
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse';
import { stringify } from 'csv-stringify/sync';

@Injectable()
export class CsvService {
    private dataDir = path.join(__dirname, '..', '..', 'data');

    constructor() {
        console.log('CSV Service initialized. Data directory:', this.dataDir);
    }

    ensureFile(filename: string, headers: string[]) {
        const filePath = path.join(this.dataDir, filename);
        if (!fs.existsSync(this.dataDir)) {
            fs.mkdirSync(this.dataDir, { recursive: true });
        }
        if (!fs.existsSync(filePath)) {
            const headerRow = stringify([headers]);
            fs.writeFileSync(filePath, headerRow);
        }
    }

    async readUtf8<T>(filename: string): Promise<T[]> {
        const filePath = path.join(this.dataDir, filename);
        if (!fs.existsSync(filePath)) {
            return [];
        }

        return new Promise((resolve, reject) => {
            const results: T[] = [];
            fs.createReadStream(filePath)
                .pipe(parse({ columns: true, trim: true }))
                .on('data', (data) => results.push(data))
                .on('error', (err) => reject(err))
                .on('end', () => resolve(results));
        });
    }

    async write<T>(filename: string, data: T[]): Promise<void> {
        const filePath = path.join(this.dataDir, filename);
        if (data.length === 0) {
            // preserve headers if possible, or just don't write anything? 
            // If empty, better not to overwrite with empty string if we want to keep headers.
            // But if headers are dynamic, this is tricky.
            // For now, assuming if we write empty array, we might lose headers unless we pass them.
            return;
        }

        // writing with headers
        const output = stringify(data, { header: true });
        await fs.promises.writeFile(filePath, output);
    }

    async append<T>(filename: string, item: T): Promise<void> {
        const filePath = path.join(this.dataDir, filename);
        // If file doesn't exist or is empty, we need headers. 
        // This simple append might fail if headers aren't there.
        // Safer to read all, push, write all for small datasets.
        // For optimization later, we can use fs.appendFile but need to handle CSV format carefully (newlines etc).
        // Given the requirement "instead of DB we using CSV", I assume small scale.

        const current = await this.readUtf8<T>(filename);
        current.push(item);
        await this.write(filename, current);
    }
}
