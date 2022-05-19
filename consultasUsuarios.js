const { Pool } = require('pg');
const pool = new Pool ({
    connectionString: process.env.DATABASE_URL,
        ssl: {
        rejectUnauthorized: false
        }
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

async function validarUsuario(email, moderador){
    try {
        const res = await pool.query(
            `UPDATE usuarios SET moderador = $2
            WHERE email = $1 RETURNING*;`,
            [email, moderador]
        );
        return res.rows;
    } catch (e) {
        console.log(e)
    }
};

const deleteUsuario = async (email) => {
    const consulta = `
    DELETE FROM mensajes WHERE autor = '${email}';
    DELETE FROM usuarios WHERE email = '${email}';
    `;
    try {
        const result = await pool.query(consulta);
        console.log(result.rowCount)
        return result;
    } catch (error) {
        console.log(error);
        return error;
    }
};

async function deleteImagenesUsuario(email){
    try {
        const res = await pool.query(
            `SELECT multimedia,seccion 
            FROM mensajes
            WHERE autor = $1`,
            [email]
        );
        return res.rows;
    } catch (e) {
        console.log(e)
    }
};

module.exports = {
    nuevoUsuario,
    getUsuarios,
    editUsuario,
    validarUsuario,
    deleteUsuario,
    deleteImagenesUsuario,
}