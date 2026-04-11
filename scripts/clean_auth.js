const { Client } = require('pg');

async function cleanProject(url) {
  const client = new Client({ connectionString: url });
  try {
    await client.connect();
    console.log('Connected to ' + url.split('@')[1]);
    
    const res = await client.query('SELECT id, email FROM auth.users');
    console.log('Users found:', res.rows.map(u => u.email));
    
    const deleteRes = await client.query("DELETE FROM auth.users WHERE email != 'teste@leadgers.com'");
    console.log('Deleted rows:', deleteRes.rowCount);
    
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}

async function run() {
  const urls = [
    'postgresql://postgres:leadgers%402026%21Dev@db.grqhnhftseisxsobamju.supabase.co:5432/postgres',
    'postgresql://postgres:leadgers%402026%21Dev@db.yuldkgknnvvtmlpkqsji.supabase.co:5432/postgres'
  ];
  for (const url of urls) {
    await cleanProject(url);
  }
}

run();
