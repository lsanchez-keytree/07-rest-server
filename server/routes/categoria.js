const express = require('express');

const {
    verificaToken,
    verificaAdmin_Role,
} = require('../middlewares/autenticacion');

const Categoria = require('../models/categoria');

const app = express();

// ============================
// Mostrar todas las categorías
// ============================
app.get('/categoria', verificaToken, (req, res) => {
    Categoria.find({})
        .sort('nombre')
        .populate('usuario', 'nombre email')
        .exec((err, categorias) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err,
                });
            }

            Categoria.countDocuments((err, conteo) => {
                res.json({
                    ok: true,
                    categorias,
                    total: conteo,
                });
            });
        });
});

// ============================
// Mostrar una categoría por ID
// ============================
app.get('/categoria/:id', verificaToken, (req, res) => {
    let id = req.params.id;

    Categoria.findById(id, (err, categoria) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err,
            });
        }
        res.json({
            ok: true,
            categoria,
        });
    });
});

// ============================
// Crear nueva categoría
// ============================
app.post('/categoria', verificaToken, (req, res) => {
    // regresa nueva categoria
    // req.usuario._id
    let categoria = new Categoria({
        nombre: req.body.nombre,
        usuario: req.usuario._id,
    });

    categoria.save((err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err,
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err,
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB,
        });
    });
});

// ============================
// Actualizar una categoría
// ============================
app.put('/categoria/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    let body = req.body.nombre;

    Categoria.findByIdAndUpdate(
        id,
        body,
        { new: true, runValidators: true, context: 'query' },
        (err, categoriaBD) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err,
                });
            }

            if (!categoriaDB) {
                return res.status(400).json({
                    ok: false,
                    err,
                });
            }

            res.json({
                ok: true,
                categoria: categoriaBD,
            });
        }
    );
});

// ============================
// Eliminar una categoría
// ============================
app.delete(
    '/categoria/:id',
    [verificaToken, verificaAdmin_Role],
    (req, res) => {
        // solo ADMIN puede borrar
        // borrar de BD
        // Categoria.findByIdAndRemove
        let id = req.params.id;

        Categoria.findByIdAndRemove(id, { new: true }, (err, categoriaDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err,
                });
            }

            if (!categoriaDB) {
                return res.status(400).json({
                    ok: false,
                    message: 'El id no existe',
                });
            }

            res.json({
                ok: true,
                message: `Categoría [${categoriaDB.nombre}] borrada`,
            });
        });
    }
);

module.exports = app;
