const express = require('express');
const {
    verificaToken,
    verificaAdmin_Role,
} = require('../middlewares/autenticacion');

const Producto = require('../models/producto');

const app = express();

const disponible = { disponible: true };

// ============================
// Obtener productos
// ============================
app.get('/producto', verificaToken, (req, res) => {
    const desde = +req.query.desde || 0;

    Producto.find(disponible)
        .sort('nombre')
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'nombre')
        .exec((err, productos) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err,
                });
            }

            res.json({
                ok: true,
                productos,
            });
        });
});

// ============================
// Obtener un producto por ID
// ============================
app.get('/producto/:id', verificaToken, (req, res) => {
    // populate: usuario, categoria
    const id = req.params.id;

    Producto.findById(id)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'nombre')
        .exec((err, productoDB) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err,
                });
            }

            res.json({
                ok: true,
                producto: productoDB,
            });
        });
});

// ============================
// Buscar productos
// ============================
app.get('/producto/buscar/:termino', verificaToken, (req, res) => {
    let termino = req.params.termino;

    let regex = new RegExp(termino, 'i');

    Producto.find({ nombre: regex })
        .populate('categoria', 'nombre')
        .exec((err, productos) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err,
                });
            }

            res.json({
                ok: true,
                productos,
            });
        });
});

// ============================
// Crear un nuevo producto
// ============================
app.post('/producto', verificaToken, (req, res) => {
    // grabar: usuario, categoria
    let body = req.body;

    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        categoria: body.categoria,
        usuario: req.usuario._id,
    });

    producto.save((err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err,
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err,
            });
        }

        res.status(201).json({
            ok: true,
            producto: productoDB,
        });
    });
});

// ============================
// Actualizar un  producto
// ============================
app.put('/producto/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    let body = req.body;

    Producto.findById(id, (err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err,
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: { message: 'El producto NO existe' },
            });
        }

        productoDB.nombre = body.nombre;
        productoDB.precioUni = body.precioUni;
        productoDB.categoria = body.categoria;
        productoDB.disponible = body.disponible;
        productoDB.descripcion = body.descripcion;

        productoDB.save((err, productoGuardado) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err,
                });
            }
            res.json({
                ok: true,
                producto: productoGuardado,
            });
        });
    });
});

// ============================
// Borrar un  producto
// ============================
app.delete('/producto/:id', [verificaToken, verificaAdmin_Role], (req, res) => {
    // cambiar 'disponible'
    let id = req.params.id;
    let cambiaEstado = { estado: false };

    Producto.findById(id, (err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err,
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: { message: 'El producto NO existe' },
            });
        }

        productoDB.disponible = false;

        productoDB.save((err, productoBorrado) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err,
                });
            }
            res.json({
                ok: true,
                producto: productoBorrado,
                message: 'Producto borrado',
            });
        });
    });
});

module.exports = app;
