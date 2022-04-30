const { Pool } = require('pg');
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    password: '',
    database: 'agendasamus',
    port: 5432
});

async function nuevoUsuario(email,nombre,pass,img){
    try{
        const result = await pool.query(
            `INSERT INTO usuarios (email, nombre, password, foto, administrador, moderador, usuario) 
            values ($1,$2,$3,$4,false,false,true) RETURNING *;`,
            [email,nombre,pass,img]
        );
        return result.rows;
    }   catch(e)
    {
        return e;
    }
}

async function getUsuarios() {
    try {
        const result = await pool.query(`SELECT * FROM usuarios`);
        return result.rows;
    }   catch(e) {
        return e;
    }
}

async function editUsuario(email, newnombre, newpass){
    try {
        const res = await pool.query(
            `UPDATE usuarios SET (nombre, password) = ($2,$3)
            WHERE email = $1 RETURNING*;`,
            [email, newnombre, newpass]
        );
        return res.rows;
    } catch (e) {
        console.log(e)
    }
}

async function validarUsuario(email, estado){
    try {
        const res = await pool.query(
            `UPDATE usuarios SET moderador = $2
            WHERE email = $1 RETURNING*;`,
            [email, estado]
        );
        return res.rows;
    } catch (e) {
        console.log(e)
    }
}

async function deleteUsuario(email) {
    try {
        const result = await pool.query(
            `DELETE FROM usuarios WHERE email = $1 RETURNING *`,
            [email]
        );
        return result.rowCount;
    }   catch (e) {
        return e
    }
}

module.exports = {
    nuevoUsuario,
    getUsuarios,
    editUsuario,
    validarUsuario,
    deleteUsuario,
}