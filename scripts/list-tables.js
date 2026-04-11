const { Client } = require('pg');

async function listTables() {
    const client = new Client({
        connectionString: 'postgresql://postgres:leadgers%402026%21Dev@db.grqhnhftseisxsobamju.supabase.co:5432/postgres'
    });
    
    await client.connect();
    
    const query = `
        SELECT table_schema, table_name 
        FROM information_schema.tables 
        WHERE table_schema NOT IN ('information_schema', 'pg_catalog', 'storage', 'extensions')
        ORDER BY table_schema, table_name;
    `;

    const res = await client.query(query);
    console.log("📋 Todas as tabelas no banco:");
    res.rows.forEach(row => {
        console.log(` - ${row.table_schema}.${row.table_name}`);
    });

    await client.end();
}

listTables().catch(console.error);
