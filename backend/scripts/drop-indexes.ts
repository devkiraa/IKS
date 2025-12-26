import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

async function dropManuscriptIndexes() {
    const uri = process.env.MONGO_URI_MANUSCRIPTS || 'mongodb://localhost:27017/manuscripts';

    console.log('Connecting to MongoDB Manuscripts DB...');
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db();

        console.log('Dropping indexes on manuscripts collection...');
        await db.collection('manuscripts').dropIndexes();
        console.log('✅ All indexes dropped successfully!');
        console.log('Restart the backend to recreate indexes with the correct configuration.');
    } catch (error: any) {
        if (error.code === 26 || error.codeName === 'NamespaceNotFound') {
            console.log('ℹ️ No indexes to drop (collection may not exist yet).');
        } else {
            console.error('Error dropping indexes:', error.message);
        }
    } finally {
        await client.close();
        process.exit(0);
    }
}

dropManuscriptIndexes();
