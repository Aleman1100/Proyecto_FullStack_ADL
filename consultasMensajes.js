const { Pool } = require('pg');
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    password: '',
    database: 'agendasamus',
    port: 5432
});

async function nuevoMensaje(contenido, multimedia, autor){
    try{
        const result = await pool.query(
            `INSERT INTO mensajes (contenido, multimedia, autor) 
            values ($1,$2,$3) RETURNING *;`,
            [contenido, multimedia, autor]
        );
        return result.rows;
    }   catch(e)
    {
        return e;
    }
}

async function getMensajes() {
    try {
        const result = await pool.query(`SELECT * FROM mensajes`);
        return result.rows;
    }   catch(e) {
        return e;
    }
}

async function editMensajes(email, newContenido, newMultimedia){
    try {
        const res = await pool.query(
            `UPDATE mensajes SET (newContenido, newContenido) = ($2,$3)
            WHERE email = $1 RETURNING*;`,
            [email, newContenido, newMultimedia]
        );
        return res.rows;
    } catch (e) {
        console.log(e)
    }
}

async function validarMensajes(email, estado){
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

async function deleteMensajes(email) {
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
    nuevoMensaje,
    getMensajes,
    editMensajes,
    validarMensajes,
    deleteMensajes,
}