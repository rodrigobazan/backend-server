var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

// default options
app.use(fileUpload());

app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    //Tipos de coleccion
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de coleccion no es valida',
            errors: {message: 'Tipo de coleccion no es valida'}
        });
    }

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No selecciono nada',
            errors: {message: 'Debe seleccionar una imagen'}
        });
    }

    // Obtener nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    // Solo estas extensiones aceptamos
    var extenasionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extenasionesValidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extension no válida',
            errors: {message: 'Las extensiones validas son ' + extenasionesValidas.join(', ')}
        });
    }

    // Nombre de archivo personalizado
    var nombreArchivo = `${ id }-${ new Date().getMilliseconds()}.${extensionArchivo}`;

    // Mover el archivo del temporal a un especificico
    var path = `./uploads/${tipo}/${nombreArchivo}`;

    archivo.mv(path, err => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                errors: err
            });
        }

        subirPorTipo(tipo, id, nombreArchivo, res)


    });
});

function subirPorTipo(tipo, id, nombreArchivo, res) {

    if (tipo === 'usuarios') {
        Usuario.findById(id, (err, usuario) => {

            if(!usuario){
                return res.status(400).json({
                    ok: true,
                    mensaje: 'Usuario no existe',
                    errors: {message: 'Usuario no existe'}
                });
            }

            var pathViejo = './uploads/usuarios/' + usuario.img;
            //Si existe, elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }
            usuario.img = nombreArchivo;
            usuario.save((err, usuarioActualizado) => {
                usuarioActualizado.password = ':)';
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualzada',
                    usuario: usuarioActualizado
                });
            });
        });
    }
    if (tipo === 'medicos') {
        Medico.findById(id, (err, medico) => {

            if(!medico){
                return res.status(400).json({
                    ok: true,
                    mensaje: 'Medico no existe',
                    errors: {message: 'Medico no existe'}
                });
            }

           var pathViejo = './uploads/medicos/'+ medico.img;
           //Si existe, elimina la imagen anterior
            if(fs.existsSync(pathViejo)){
                fs.unlink(pathViejo);
            }
            medico.img = nombreArchivo;
            medico.save((err, medicoActualizado) => {
               return res.status(200).json({
                   ok: true,
                   mensaje: 'Imagen de medico actualzada',
                   medico: medicoActualizado
               });
            });

        });
    }
    if (tipo === 'hospitales') {
        Hospital.findById(id, (err, hospital) =>{
            if(!hospital){
                return res.status(400).json({
                    ok: true,
                    mensaje: 'Hospital no existe',
                    errors: {message: 'Hospital no existe'}
                });
            }

            var pathViejo = '/uploads/hospitales/'+ hospital.img;
            //Si existe, elimina la imagen anterior
            if(fs.existsSync(pathViejo)){
                fs.unlink(pathViejo);
            }
            hospital.img = nombreArchivo;
            hospital.save((err, hospitalActualizado) => {
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de hospital actualzada',
                    hospital: hospitalActualizado
                });
            });
        });
    }

}


module.exports = app;