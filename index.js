const express = require('express')
const app = express()
const port = process.env.PORT || 3000
const jwt = require('jsonwebtoken')
const bodyParser = require('body-parser');
const fs = require('fs')
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const exphbs = require("express-handlebars");
const expressFileUpload = require('express-fileupload');
app.use( expressFileUpload({
    limits: { fileSize: 5000000 },
    abortOnLimit: true,
    responseOnLimit: "Peso del archivo es mayor a lo permitido",
    })
);
app.listen(port, () => console.log(`Up en ${port}`))

app.use(express.static("assets"));
app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist/css'))
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist'))
app.set('view engine', 'handlebars');
app.use("/css", express.static(__dirname + "/node_modules/bootstrap/dist/css"));
app.engine(
    'handlebars',
    exphbs.engine ({
        layoutsDir: __dirname + '/views',
        partialsDir: __dirname + '/views/componentes/',
    })
);

app.get('/', (req,res) => {
    res.render('index', {
        layout: 'index'
    });
});

app.get('/Registro', (req,res) => {
    res.render('registro', {
        layout: 'registro'
    });
});

app.get('/Login', (req,res) => {
    res.render('login', {
        layout: 'login'
    });
});

const { nuevoUsuario,getUsuarios,editUsuario,validarUsuario,deleteUsuario } = require('./consultasUsuarios.js');
const { nuevoMensaje,getMensajes,editMensajes,validarMensajes,deleteMensajes } = require('./consultasMensajes.js');

const secretKey = 'KirbyMariano'

app.get('/token', (req, res) => {
    const { token } = req.query;
    jwt.verify(token, secretKey, (err, data) => {
        res.send( err ? 'Token invalido' : data );
    });
});

app.get('/SignIn', async (req, res) => {
    const { email, password } = req.query;
    const respuesta = await getUsuarios()
    const user = respuesta.find((u) => u.email == email && u.password == password);
    console.log(user)
    console.log(user.administrador)
    if (user.administrador == true) {
        const token = jwt.sign(
            {
                exp: Math.floor(Date.now() / 1000) + 120,
                data: user,
            },
            secretKey
        );
        res.send(`
        <META HTTP-EQUIV="REFRESH" CONTENT="1;URL=http://localhost:3000/Admin?token=${token}">
        Admin ${email}.
        <script>
        sessionStorage.setItem('token', JSON.stringify('${token}'))
        </script>
        `);
    } else if (user.moderador == true) {
        const token = jwt.sign(
            {
                exp: Math.floor(Date.now() / 1000) + 120,
                data: user,
            },
            secretKey
        );
        res.send(`
        <META HTTP-EQUIV="REFRESH" CONTENT="1;URL=http://localhost:3000/Colaborador?token=${token}">
        Colaborador ${email}.
        <script>
        sessionStorage.setItem('token', JSON.stringify('${token}'))
        </script>
        `);
    } else {
        res.send('Usuario o contraseña incorrectas');
    }
});

app.get('/Admin', (req,res) => {
    let { token } = req.query;
    jwt.verify(token, secretKey, (err,decoded) => {
        err
            ? res.status(401).send({
                error: '401 No autorizado',
                message: err.message,
            })
            :
            res.render('admin', {
                layout: 'admin',
                token:token,
                email: decoded.data.email,
                nombre: decoded.data.nombre,
                password: decoded.data.password,                
            });
    });
});

app.get('/Colaborador', (req,res) => {
    let { token } = req.query;
    jwt.verify(token, secretKey, (err,decoded) => {
        err
            ? res.status(401).send({
                error: '401 No autorizado',
                message: err.message,
            })
            :
            res.render('colaborador', {
                layout: 'colaborador',
                token:token,
                email: decoded.data.email,
                nombre: decoded.data.nombre,
                password: decoded.data.password,                
            });
    });
});

// Inicio rutas para cada vista
let data = JSON.parse(fs.readFileSync('usuarios.json', 'utf8'))

app.post('/usuario', async (req, res) => {
    const email = req.body.email
    const nombre = req.body.nombre
    const pass1 = req.body.password1
    const pass2 = req.body.password2
    if (pass1 == pass2){
        const pass = pass1
        const { foto_usuario } = req.files;
        const img = `foto-${email}`;
        foto_usuario.mv(`${__dirname}/assets/img/perfiles/${img}.jpg`, (err) => {
            console.log('Imagen agregada correctamente')
        })
        const respuesta = await nuevoUsuario(email,nombre,pass,img)
        const respuesta2 = await getUsuarios();
        fs.writeFileSync('usuarios.json', JSON.stringify(respuesta2))
        res.render('registro', {
            layout: 'registro',
        });
        console.log(respuesta[0])
        console.log("Registro exitoso")
    } else {
        console.log('Contraseñas no coinciden')
    }
});

app.get('/usuarios', async (req,res) => {
    const respuesta = await getUsuarios();
    res.send(respuesta);
    fs.writeFileSync('usuarios.json', JSON.stringify(respuesta))
})

app.post('/usuarioEdit', async (req,res) => {
    const email = req.body.correo
    const nombre = req.body.name
    const pass1 = req.body.pass1
    const pass2 = req.body.pass2
    const exp = req.body.exp
    const esp = req.body.esp
    if (pass1 == pass2){
        const pass = pass1
        const respuesta = await editUsuario(email,nombre,pass,exp,esp)
        console.log(respuesta)
        console.log('Usuario editado correctamente')
        const respuesta2 = await getUsuarios();
        fs.writeFileSync('usuarios.json', JSON.stringify(respuesta2))
        res.render('login', {
            layout: 'login',
        });
    } else {
        console.log('Contraseñas no coinciden')
    }

})

app.put('/usuario', async (req, res) => {
    const { email, estado } = req.body;
    const respuesta = await validarUsuario(email, estado);
    const respuesta2 = await getUsuarios();
    console.log(respuesta2)
    console.log(respuesta[0])
    console.log('usuario validado')
    fs.writeFileSync('usuarios.json', JSON.stringify(respuesta2))
    res.send(console.log('Archivo actualizado'))
});


app.delete('/usuario/:email', async (req, res) => {
    const { email } = req.params;
    const respuestaLogin = await getUsuarios()
    const user = respuestaLogin.find((u) => u.email == email);
    if (user) {
        const token = jwt.sign(
            {
                exp: Math.floor(Date.now() / 1000) + 15,
                data: user,
            },
            secretKey
        );
    const respuestaDelete = await deleteUsuario(email)
    console.log(respuestaDelete)
    const respuestaRefresh = await getUsuarios();
    fs.writeFileSync('usuarios.json', JSON.stringify(respuestaRefresh))
    fs.unlink(`${__dirname}/assets/img/perfiles/foto-${email}.jpg`, (err) => {
        console.log(`Imagen de ${email} eliminada`);
    });
    };
    console.log(`Usuario ${email} eliminado del JSON`)
});

// Fin rutas para cada vista