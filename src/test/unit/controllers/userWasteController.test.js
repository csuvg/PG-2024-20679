// test/unit/controllers/userWasteController.test.js
const chai = require('chai');
const sinon = require('sinon');
const userWasteController = require('../../../controllers/userWasteController');
const UserWaste = require('../../../models/UserWaste');
const User = require('../../../models/User');
const Waste = require('../../../models/Waste');
const Location = require('../../../models/Location');
const AuditLog = require('../../../models/AuditLog'); // Importar el modelo de auditoría
const { expect } = chai;

describe('UserWaste Controller', () => {
    afterEach(() => {
        sinon.restore(); // Restaurar stubs después de cada prueba
    });

    describe('makeRegister', () => {
        it('Debería registrar el desecho correctamente y registrar auditoría (medido en peso)', async () => {
            const req = {
                body: {
                    user_id: 1,
                    waste_id: 1,
                    name: 'Plastico',
                    measure_unit: 100,
                    measure_type: 'weight',
                    weight_unit: 'kg',
                    datetime: new Date(),
                    location_id: 1
                },
                user: { id: 999 }
            };
            const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
            const userWasteMock = { id: 1, name: 'Plastico', weight: 100 };

            sinon.stub(User, 'findByPk').resolves({ id: 1 });
            sinon.stub(Waste, 'findByPk').resolves({ id: 1, average_weight: 10 });
            sinon.stub(Location, 'findByPk').resolves({ id: 1 });
            sinon.stub(UserWaste, 'create').resolves(userWasteMock);
            sinon.stub(AuditLog, 'create').resolves(); // Simula el registro de auditoría

            await userWasteController.makeRegister(req, res);

            expect(res.status.calledWith(201)).to.be.true;
            expect(res.json.calledWith(sinon.match.has('data'))).to.be.true;
            expect(AuditLog.create.calledOnce).to.be.true; // Verifica que la auditoría se haya registrado
        });

        it('Debería registrar el desecho correctamente y registrar auditoría (medido en unidades)', async () => {
            const req = {
                body: {
                    user_id: 1,
                    waste_id: 1,
                    name: 'Plastico',
                    measure_unit: 10, // unidades
                    measure_type: 'unit',
                    datetime: new Date(),
                    location_id: 1
                },
                user: { id: 999 }
            };
            const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
            const userWasteMock = { id: 1, name: 'Plastico', weight: 100 }; // 10 unidades * 10 de average_weight

            sinon.stub(User, 'findByPk').resolves({ id: 1 });
            sinon.stub(Waste, 'findByPk').resolves({ id: 1, average_weight: 10 }); // Peso promedio por unidad
            sinon.stub(Location, 'findByPk').resolves({ id: 1 });
            sinon.stub(UserWaste, 'create').resolves(userWasteMock);
            sinon.stub(AuditLog, 'create').resolves(); // Simula el registro de auditoría

            await userWasteController.makeRegister(req, res);

            expect(res.status.calledWith(201)).to.be.true;
            expect(res.json.calledWith(sinon.match.has('data'))).to.be.true;
            expect(AuditLog.create.calledOnce).to.be.true; // Verifica que la auditoría se haya registrado
        });

        it('Debería devolver error si el usuario no existe', async () => {
            const req = {
                body: {
                    user_id: 999,
                    waste_id: 1,
                    name: 'Plastico',
                    measure_unit: 100,
                    measure_type: 'weight',
                    weight_unit: 'kg',
                    datetime: new Date(),
                    location_id: 1
                }
            };
            const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
            sinon.stub(User, 'findByPk').resolves(null);

            await userWasteController.makeRegister(req, res);

            expect(res.status.calledWith(404)).to.be.true;
            expect(res.json.calledWith(sinon.match.has('error'))).to.be.true;
        });

        it('Debería devolver error si el tipo de desecho no existe', async () => {
            const req = {
                body: {
                    user_id: 1,
                    waste_id: 999,
                    name: 'Plastico',
                    measure_unit: 100,
                    measure_type: 'weight',
                    weight_unit: 'kg',
                    datetime: new Date(),
                    location_id: 1
                }
            };
            const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
            sinon.stub(User, 'findByPk').resolves({ id: 1 });
            sinon.stub(Waste, 'findByPk').resolves(null);

            await userWasteController.makeRegister(req, res);

            expect(res.status.calledWith(404)).to.be.true;
            expect(res.json.calledWith(sinon.match.has('error'))).to.be.true;
        });

        it('Debería devolver error si ocurre un problema interno en la base de datos', async () => {
            const req = {
                body: {
                    user_id: 1,
                    waste_id: 1,
                    name: 'Plastico',
                    measure_unit: 100,
                    measure_type: 'weight',
                    weight_unit: 'kg',
                    datetime: new Date(),
                    location_id: 1
                }
            };
            const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
            sinon.stub(UserWaste, 'create').throws(new Error('Database error'));

            await userWasteController.makeRegister(req, res);

            expect(res.status.calledWith(500)).to.be.true;
            expect(res.json.calledWith(sinon.match.has('error'))).to.be.true;
        });
    });

    describe('createUserWaste', () => {
        it('Debería crear un nuevo registro de UserWaste y registrar auditoría', async () => {
            const req = {
                body: {
                    user_id: 1,
                    waste_id: 1,
                    name: 'Metal',
                    measure_unit: 50,
                    measure_type: 'weight',
                    weight_unit: 'kg',
                    datetime: new Date(),
                    location_id: 1
                },
                user: { id: 999 }
            };
            const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
            const userWasteMock = { id: 1, name: 'Metal', weight: 50 };

            sinon.stub(User, 'findByPk').resolves({ id: 1 });
            sinon.stub(Waste, 'findByPk').resolves({ id: 1 });
            sinon.stub(Location, 'findByPk').resolves({ id: 1 });
            sinon.stub(UserWaste, 'create').resolves(userWasteMock);
            sinon.stub(AuditLog, 'create').resolves(); // Simula el registro de auditoría

            await userWasteController.createUserWaste(req, res);

            expect(res.status.calledWith(201)).to.be.true;
            expect(res.json.calledWith(userWasteMock)).to.be.true;
            expect(AuditLog.create.calledOnce).to.be.true; // Verifica que la auditoría se haya registrado
        });

        it('Debería devolver error si el usuario no existe', async () => {
            const req = {
                body: {
                    user_id: 999,
                    waste_id: 1,
                    name: 'Metal',
                    measure_unit: 50,
                    measure_type: 'weight',
                    weight_unit: 'kg',
                    datetime: new Date(),
                    location_id: 1
                }
            };
            const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
            sinon.stub(User, 'findByPk').resolves(null);

            await userWasteController.createUserWaste(req, res);

            expect(res.status.calledWith(404)).to.be.true;
            expect(res.json.calledWith(sinon.match.has('error'))).to.be.true;
        });

        it('Debería devolver error si ocurre un problema interno en la base de datos', async () => {
            const req = {
                body: {
                    user_id: 1,
                    waste_id: 1,
                    name: 'Metal',
                    measure_unit: 50,
                    measure_type: 'weight',
                    weight_unit: 'kg',
                    datetime: new Date(),
                    location_id: 1
                }
            };
            const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
            sinon.stub(UserWaste, 'create').throws(new Error('Database error'));

            await userWasteController.createUserWaste(req, res);

            expect(res.status.calledWith(500)).to.be.true;
            expect(res.json.calledWith(sinon.match.has('error'))).to.be.true;
        });
    });

    describe('getUserWaste', () => {
        it('Debería devolver un registro de UserWaste por su ID', async () => {
            const req = { params: { id: 1 } };
            const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
            const userWasteMock = { id: 1, name: 'Plastico', weight: 100 };
            sinon.stub(UserWaste, 'findByPk').resolves(userWasteMock);

            await userWasteController.getUserWaste(req, res);

            expect(res.status.calledWith(200)).to.be.true;
            expect(res.json.calledWith(userWasteMock)).to.be.true;
        });

        it('Debería devolver un error si el UserWaste no existe', async () => {
            const req = { params: { id: 999 } };
            const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
            sinon.stub(UserWaste, 'findByPk').resolves(null);

            await userWasteController.getUserWaste(req, res);

            expect(res.status.calledWith(404)).to.be.true;
            expect(res.json.calledWith(sinon.match.has('error'))).to.be.true;
        });
    });

    describe('getUserWastes', () => {
        it('Debería devolver todos los registros de UserWaste', async () => {
            const req = {};
            const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
            const userWastesMock = [{ id: 1, name: 'Plastico', weight: 100 }];
            sinon.stub(UserWaste, 'findAll').resolves(userWastesMock);

            await userWasteController.getUserWastes(req, res);

            expect(res.status.calledWith(200)).to.be.true;
            expect(res.json.calledWith(userWastesMock)).to.be.true;
        });

        it('Debería devolver un error si ocurre un problema al recuperar los registros', async () => {
            const req = {};
            const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
            sinon.stub(UserWaste, 'findAll').throws(new Error('Database error'));

            await userWasteController.getUserWastes(req, res);

            expect(res.status.calledWith(500)).to.be.true;
            expect(res.json.calledWith(sinon.match.has('error'))).to.be.true;
        });
    });

    describe('updateUserWaste', () => {
        it('Debería actualizar un registro de UserWaste y registrar auditoría', async () => {
            const req = { params: { id: 1 }, body: { measure_unit: 200, measure_type: 'weight', weight_unit: 'kg' }, user: { id: 999 } };
            const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
            
            // Simula el objeto UserWaste con el método save
            const userWasteMock = { 
                id: 1, 
                name: 'Plastico', 
                weight: 100,
                save: sinon.stub().resolves(), // Simula la función save
                dataValues: { weight: 100 } // Para oldValues
            };
            
            // Simula la consulta de UserWaste
            sinon.stub(UserWaste, 'findByPk').resolves(userWasteMock);
            
            // Simula la consulta de Waste
            const wasteMock = { id: 1, average_weight: 10 };
            sinon.stub(Waste, 'findByPk').resolves(wasteMock);
            
            // Simula el registro de auditoría
            sinon.stub(AuditLog, 'create').resolves();
        
            await userWasteController.updateUserWaste(req, res);
    
            // Verifica que la función `save` haya sido llamada
            expect(userWasteMock.save.calledOnce).to.be.true;
    
            // Verifica que la respuesta sea correcta
            expect(res.status.calledWith(200)).to.be.true;
            expect(res.json.calledWith(userWasteMock)).to.be.true;
    
            // Verifica que la auditoría se haya registrado
            expect(AuditLog.create.calledOnce).to.be.true;
        });          

        it('Debería devolver un error si el UserWaste no existe', async () => {
            const req = { params: { id: 999 }, body: { measure_unit: 15, measure_type: 'weight', weight_unit: 'kg' } };
            const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
            sinon.stub(UserWaste, 'findByPk').resolves(null);

            await userWasteController.updateUserWaste(req, res);

            expect(res.status.calledWith(404)).to.be.true;
            expect(res.json.calledWith(sinon.match.has('error'))).to.be.true;
        });

        it('Debería devolver error si ocurre un problema interno en la base de datos', async () => {
            const req = { params: { id: 1 }, body: { measure_unit: 200, measure_type: 'weight', weight_unit: 'kg' }, user: { id: 999 } };
            const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
            sinon.stub(UserWaste, 'findByPk').throws(new Error('Database error'));

            await userWasteController.updateUserWaste(req, res);

            expect(res.status.calledWith(500)).to.be.true;
            expect(res.json.calledWith(sinon.match.has('error'))).to.be.true;
        });
    });

    describe('deleteUserWaste', () => {
        it('Debería eliminar un registro de UserWaste por su ID y registrar auditoría', async () => {
            const req = { params: { id: 1 }, user: { id: 999 } };
            const res = { status: sinon.stub().returnsThis(), send: sinon.stub() };
            sinon.stub(UserWaste, 'findByPk').resolves({ destroy: sinon.stub().resolves() });
            sinon.stub(AuditLog, 'create').resolves(); // Simula el registro de auditoría

            await userWasteController.deleteUserWaste(req, res);

            expect(res.status.calledWith(204)).to.be.true;
            expect(AuditLog.create.calledOnce).to.be.true; // Verifica que la auditoría se haya registrado
        });

        it('Debería devolver un error si el UserWaste no existe', async () => {
            const req = { params: { id: 999 } };
            const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
            sinon.stub(UserWaste, 'findByPk').resolves(null);

            await userWasteController.deleteUserWaste(req, res);

            expect(res.status.calledWith(404)).to.be.true;
            expect(res.json.calledWith(sinon.match.has('error'))).to.be.true;
        });

        it('Debería devolver error si ocurre un problema interno en la base de datos', async () => {
            const req = { params: { id: 1 }, user: { id: 999 } };
            const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
            sinon.stub(UserWaste, 'findByPk').throws(new Error('Database error'));

            await userWasteController.deleteUserWaste(req, res);

            expect(res.status.calledWith(500)).to.be.true;
            expect(res.json.calledWith(sinon.match.has('error'))).to.be.true;
        });
    });
});
