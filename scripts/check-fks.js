const { Client } = require('pg');

async function checkFKs() {
    const client = new Client({
        connectionString: 'postgresql://postgres:leadgers%402026%21Dev@db.grqhnhftseisxsobamju.supabase.co:5432/postgres'
    });
    
    await client.connect();
    
    console.log("🔍 Buscando Foreign Keys que apontam para auth.users...");
    
    const query = `
        SELECT
            tc.table_schema, 
            tc.table_name, 
            kcu.column_name, 
            ccu.table_schema AS foreign_table_schema,
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name 
        FROM 
            information_schema.table_constraints AS tc 
            JOIN information_schema.key_column_usage AS kcu
              ON tc.constraint_name = kcu.constraint_name
              AND tc.table_schema = kcu.table_schema
            JOIN information_schema.constraint_column_usage AS ccu
              ON ccu.constraint_name = tc.constraint_name
              AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY' 
          AND ccu.table_name = 'users'
          AND ccu.table_schema = 'auth';
    `;

    const res = await client.query(query);
    console.log("📋 Tabelas com FK para auth.users:");
    res.rows.forEach(fk => {
        console.log(` - ${fk.table_schema}.${fk.table_name} (${fk.column_name})`);
    });

    await client.end();
}

checkFKs().catch(console.error);
