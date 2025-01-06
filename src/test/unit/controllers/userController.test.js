const chai = require('chai');
const sinon = require('sinon');
const bcrypt = require('bcrypt');
const userController = require('../../../controllers/userController');
const User = require('../../../models/User');
const AuditLog = require('../../../models/AuditLog'); // Importa el modelo de auditoría
const { expect } = chai;

describe('User Controller', () => {
    afterEach(() => {
        sinon.restore(); // Restaurar mocks y stubs después de cada prueba
    });

    describe('createUser', () => {
        it('Debería crear un nuevo usuario y registrar auditoría', async () => {
            const req = { body: { email: 'test@example.com', password: 'password123' }, user: { id: 999 } };
            const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
            const userMock = { id: 1, email: 'test@example.com' };
            
            sinon.stub(User, 'findOne').resolves(null); // Simula que el email no está en uso.
            sinon.stub(User, 'create').resolves(userMock);
            sinon.stub(AuditLog, 'create').resolves(); // Simula la creación del registro de auditoría

            await userController.createUser(req, res);

            expect(res.status.calledWith(201)).to.be.true;
            expect(res.json.calledWith(sinon.match.has('data'))).to.be.true;
            expect(AuditLog.create.calledOnce).to.be.true; // Verifica que se registró la auditoría
        });

        it('Debería retornar un error si el email ya está en uso', async () => {
            const req = { body: { email: 'test@example.com', password: 'password123' } };
            const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };

            sinon.stub(User, 'findOne').resolves({ email: 'test@example.com' });

            await userController.createUser(req, res);

            expect(res.status.calledWith(400)).to.be.true;
            expect(res.json.calledWith(sinon.match.has('error'))).to.be.true;
        });

        it('Debería retornar un error si los datos de entrada son inválidos', async () => {
            const req = { body: { email: '', password: '' } }; // Datos inválidos
            const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };

            await userController.createUser(req, res);

            expect(res.status.calledWith(400)).to.be.true;
            expect(res.json.calledWith(sinon.match.has('error'))).to.be.true;
        });

        it('Debería retornar un error 500 si ocurre un problema en el servidor', async () => {
            const req = { body: { email: 'test@example.com', password: 'password123' } };
            const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };

            sinon.stub(User, 'findOne').throws(new Error('Database error'));

            await userController.createUser(req, res);

            expect(res.status.calledWith(500)).to.be.true;
            expect(res.json.calledWith(sinon.match.has('error'))).to.be.true;
        });
    });

    describe('loginUser', () => {
        it('Debería iniciar sesión correctamente', async () => {
            const req = { body: { email: 'test@example.com', password: 'password123' } };
            const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
            const userMock = { id: 1, email: 'test@example.com', password: 'hashedpassword' };

            sinon.stub(User, 'findOne').resolves(userMock);
            sinon.stub(bcrypt, 'compare').resolves(true); // Simula que la contraseña coincide.

            await userController.loginUser(req, res);

            expect(res.status.calledWith(200)).to.be.true;
            expect(res.json.calledWith(sinon.match.has('data'))).to.be.true;
        });

        it('Debería retornar un error si el email o la contraseña son incorrectos', async () => {
            const req = { body: { email: 'test@example.com', password: 'password123' } };
            const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };

            sinon.stub(User, 'findOne').resolves(null); // Simula que no se encontró el usuario.

            await userController.loginUser(req, res);

            expect(res.status.calledWith(404)).to.be.true;
            expect(res.json.calledWith(sinon.match.has('error'))).to.be.true;
        });

        it('Debería retornar un error 500 si ocurre un problema en el servidor', async () => {
            const req = { body: { email: 'test@example.com', password: 'password123' } };
            const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };

            sinon.stub(User, 'findOne').throws(new Error('Database error'));

            await userController.loginUser(req, res);

            expect(res.status.calledWith(500)).to.be.true;
            expect(res.json.calledWith(sinon.match.has('error'))).to.be.true;
        });
    });

    describe('updatePassword', () => {
        it('Debería actualizar la contraseña correctamente y registrar auditoría', async () => {
            const req = {
                params: { id: 1 },
                body: { oldPassword: 'oldPassword123', newPassword: 'newPassword123' },
                user: { id: 999 }
            };
            const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
            const userMock = { id: 1, password: 'hashedOldPassword', update: sinon.stub().resolves() };

            sinon.stub(User, 'findByPk').resolves(userMock);
            sinon.stub(bcrypt, 'compare').resolves(true); // Simula que las contraseñas coinciden.
            sinon.stub(bcrypt, 'hash').resolves('hashedNewPassword');
            sinon.stub(AuditLog, 'create').resolves();

            await userController.updatePassword(req, res);

            expect(userMock.update.calledWith({ password: 'hashedNewPassword' })).to.be.true;
            expect(res.status.calledWith(200)).to.be.true;
            expect(res.json.calledWith(sinon.match.has('message'))).to.be.true;
            expect(AuditLog.create.calledOnce).to.be.true;
        });

        it('Debería retornar un error si la contraseña antigua es incorrecta', async () => {
            const req = {
                params: { id: 1 },
                body: { oldPassword: 'wrongPassword', newPassword: 'newPassword123' }
            };
            const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
            const userMock = { id: 1, password: 'hashedOldPassword' };

            sinon.stub(User, 'findByPk').resolves(userMock);
            sinon.stub(bcrypt, 'compare').resolves(false); // Simula que la contraseña antigua no coincide.

            await userController.updatePassword(req, res);

            expect(res.status.calledWith(400)).to.be.true;
            expect(res.json.calledWith(sinon.match.has('error'))).to.be.true;
        });

        it('Debería retornar un error 500 si ocurre un problema en el servidor', async () => {
            const req = { params: { id: 1 }, body: { oldPassword: 'password123', newPassword: 'newPassword123' } };
            const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };

            sinon.stub(User, 'findByPk').throws(new Error('Database error'));

            await userController.updatePassword(req, res);

            expect(res.status.calledWith(500)).to.be.true;
            expect(res.json.calledWith(sinon.match.has('error'))).to.be.true;
        });
    });

    describe('uploadProfilePhoto', () => {
        it('Debería subir una foto de perfil correctamente y registrar auditoría', async () => {
            const req = {
                params: { id: 1 },
                body: { profile_photo: 'base64photo' },
                user: { id: 999 }
            };
            const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
            const userMock = { id: 1, profile_photo: null, save: sinon.stub().resolves() };

            sinon.stub(User, 'findByPk').resolves(userMock);
            sinon.stub(AuditLog, 'create').resolves(); 

            await userController.uploadProfilePhoto(req, res);

            expect(userMock.save.calledOnce).to.be.true;
            expect(res.status.calledWith(200)).to.be.true;
            expect(res.json.calledWith(sinon.match.has('message'))).to.be.true;
            expect(AuditLog.create.calledOnce).to.be.true;
        });

        it('Debería retornar un error si no se proporciona una imagen', async () => {
            const req = { params: { id: 1 }, body: {} }; // Falta la foto.
            const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };

            sinon.stub(User, 'findByPk').resolves({ id: 1 });

            await userController.uploadProfilePhoto(req, res);

            expect(res.status.calledWith(400)).to.be.true;
            expect(res.json.calledWith(sinon.match.has('error'))).to.be.true;
        });

        it('Debería retornar un error 500 si ocurre un problema en el servidor', async () => {
            const req = { params: { id: 1 }, body: { profile_photo: 'base64photo' } };
            const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };

            sinon.stub(User, 'findByPk').throws(new Error('Database error'));

            await userController.uploadProfilePhoto(req, res);

            expect(res.status.calledWith(500)).to.be.true;
            expect(res.json.calledWith(sinon.match.has('error'))).to.be.true;
        });
    });

    describe('getUser', () => {
        it('Debería obtener un usuario por su ID', async () => {
            const req = { params: { id: 1 } };
            const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
            const userMock = { id: 1, email: 'test@example.com' };

            sinon.stub(User, 'findByPk').resolves(userMock);

            await userController.getUser(req, res);

            expect(res.status.calledWith(200)).to.be.true;
            expect(res.json.calledWith(sinon.match.has('data'))).to.be.true;
        });

        it('Debería retornar un error si no se encuentra el usuario', async () => {
            const req = { params: { id: 1 } };
            const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };

            sinon.stub(User, 'findByPk').resolves(null);

            await userController.getUser(req, res);

            expect(res.status.calledWith(404)).to.be.true;
            expect(res.json.calledWith(sinon.match.has('error'))).to.be.true;
        });

        it('Debería retornar un error 500 si ocurre un problema en el servidor', async () => {
            const req = { params: { id: 1 } };
            const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };

            sinon.stub(User, 'findByPk').throws(new Error('Database error'));

            await userController.getUser(req, res);

            expect(res.status.calledWith(500)).to.be.true;
            expect(res.json.calledWith(sinon.match.has('error'))).to.be.true;
        });
    });

    describe('deleteUser', () => {
        it('Debería eliminar un usuario correctamente y registrar auditoría', async () => {
            const req = { params: { id: 1 }, user: { id: 999 } };
            const res = { status: sinon.stub().returnsThis(), send: sinon.stub() };
            const userMock = { id: 1, destroy: sinon.stub().resolves() };

            sinon.stub(User, 'findByPk').resolves(userMock);
            sinon.stub(AuditLog, 'create').resolves();

            await userController.deleteUser(req, res);

            expect(userMock.destroy.calledOnce).to.be.true;
            expect(res.status.calledWith(204)).to.be.true;
            expect(AuditLog.create.calledOnce).to.be.true;
        });

        it('Debería retornar un error si el usuario no existe', async () => {
            const req = { params: { id: 999 } };
            const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };

            sinon.stub(User, 'findByPk').resolves(null);

            await userController.deleteUser(req, res);

            expect(res.status.calledWith(404)).to.be.true;
            expect(res.json.calledWith(sinon.match.has('error'))).to.be.true;
        });

        it('Debería retornar un error 500 si ocurre un problema en el servidor', async () => {
            const req = { params: { id: 1 } };
            const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };

            sinon.stub(User, 'findByPk').throws(new Error('Database error'));

            await userController.deleteUser(req, res);

            expect(res.status.calledWith(500)).to.be.true;
            expect(res.json.calledWith(sinon.match.has('error'))).to.be.true;
        });
    });

    describe('updateUser', () => {
        it('Debería actualizar un usuario correctamente y registrar auditoría', async () => {
            const req = {
                params: { id: 1 },
                body: { username: 'UpdatedUser', email: 'updated@example.com' },
                user: { id: 999 } // Usuario que realiza la acción
            };
            const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
            const userMock = {
                id: 1,
                username: 'OriginalUser',
                email: 'original@example.com',
                dataValues: { username: 'OriginalUser', email: 'original@example.com' }, // Valores previos para auditoría
                update: sinon.stub().resolves(),
            };

            // Simulamos la búsqueda del usuario
            sinon.stub(User, 'findByPk').resolves(userMock);
            sinon.stub(AuditLog, 'create').resolves(); // Simula el registro de auditoría

            await userController.updateUser(req, res);

            expect(userMock.update.calledOnce).to.be.true;
            expect(res.status.calledWith(200)).to.be.true;
            expect(res.json.calledWith(sinon.match.has('data'))).to.be.true;
            expect(AuditLog.create.calledOnce).to.be.true; // Verifica que se registró la auditoría
        });

        it('Debería devolver un error si el usuario no es encontrado', async () => {
            const req = {
                params: { id: 999 },
                body: { username: 'UpdatedUser', email: 'updated@example.com' },
            };
            const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };

            // Simulamos que no se encuentra el usuario
            sinon.stub(User, 'findByPk').resolves(null);

            await userController.updateUser(req, res);

            expect(res.status.calledWith(404)).to.be.true;
            expect(res.json.calledWith(sinon.match.has('error'))).to.be.true;
        });

        it('Debería devolver un error 500 si ocurre un problema en el servidor', async () => {
            const req = {
                params: { id: 1 },
                body: { username: 'UpdatedUser', email: 'updated@example.com' },
            };
            const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };

            // Simulamos un error en la búsqueda del usuario
            sinon.stub(User, 'findByPk').throws(new Error('Database error'));

            await userController.updateUser(req, res);

            expect(res.status.calledWith(500)).to.be.true;
            expect(res.json.calledWith(sinon.match.has('error'))).to.be.true;
        });
    });
});
