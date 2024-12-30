// test/unit/controllers/areaController.test.js
const chai = require('chai');
const sinon = require('sinon');
const areaController = require('../../../controllers/areaController');
const Area = require('../../../models/Area');
const AuditLog = require('../../../models/AuditLog'); // Importamos el modelo de auditoría
const { expect } = chai;

describe('Area Controller', () => {
    afterEach(() => {
        sinon.restore(); // Restores all stubs and mocks after each test
    });

    describe('createArea', () => {
        it('Debería crear un área nueva y registrar auditoría', async () => {
            const req = { body: { city: 'Ciudad X', area: 100 }, user: { id: 999 } };
            const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
            const areaMock = { id: 1, city: 'Ciudad X', area: 100 };

            sinon.stub(Area, 'create').resolves(areaMock);
            sinon.stub(AuditLog, 'create').resolves(); // Simula el registro de auditoría

            await areaController.createArea(req, res);

            expect(res.status.calledWith(201)).to.be.true;
            expect(res.json.calledWith(sinon.match.has('data'))).to.be.true;
            expect(AuditLog.create.calledOnce).to.be.true; // Verifica que la auditoría se haya registrado
        });

        it('Debería devolver un error si faltan datos requeridos', async () => {
            const req = { body: { city: '' } }; // Faltan datos de 'area'
            const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };

            await areaController.createArea(req, res);

            expect(res.status.calledWith(400)).to.be.true;
            expect(res.json.calledWith(sinon.match.has('error'))).to.be.true;
        });

        it('Debería devolver un error si ocurre un problema en la creación', async () => {
            const req = { body: { city: 'Ciudad X', area: 100 } };
            const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
            sinon.stub(Area, 'create').throws(new Error('Database error'));

            await areaController.createArea(req, res);

            expect(res.status.calledWith(500)).to.be.true;
            expect(res.json.calledWith(sinon.match.has('error'))).to.be.true;
        });
    });

    describe('getArea', () => {
        it('Debería devolver un área por su ID', async () => {
            const req = { params: { id: 1 } };
            const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
            const areaMock = { id: 1, city: 'Ciudad X', area: 100 };
            sinon.stub(Area, 'findByPk').resolves(areaMock);

            await areaController.getArea(req, res);

            expect(res.status.calledWith(200)).to.be.true;
            expect(res.json.calledWith(sinon.match.has('data'))).to.be.true;
        });

        it('Debería devolver un error si el área no existe', async () => {
            const req = { params: { id: 999 } }; // ID inexistente
            const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
            sinon.stub(Area, 'findByPk').resolves(null);

            await areaController.getArea(req, res);

            expect(res.status.calledWith(404)).to.be.true;
            expect(res.json.calledWith(sinon.match.has('error'))).to.be.true;
        });

        it('Debería devolver un error si ocurre un problema al recuperar el área', async () => {
            const req = { params: { id: 1 } };
            const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
            sinon.stub(Area, 'findByPk').throws(new Error('Database error'));

            await areaController.getArea(req, res);

            expect(res.status.calledWith(500)).to.be.true;
            expect(res.json.calledWith(sinon.match.has('error'))).to.be.true;
        });
    });

    describe('getAreas', () => {
        it('Debería devolver todas las áreas', async () => {
            const req = {};
            const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
            const areasMock = [{ id: 1, city: 'Ciudad X', area: 100 }];
            sinon.stub(Area, 'findAll').resolves(areasMock);

            await areaController.getAreas(req, res);

            expect(res.status.calledWith(200)).to.be.true;
            expect(res.json.calledWith(sinon.match.has('data'))).to.be.true;
        });

        it('Debería devolver un error si ocurre un problema al recuperar las áreas', async () => {
            const req = {};
            const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
            sinon.stub(Area, 'findAll').throws(new Error('Database error'));

            await areaController.getAreas(req, res);

            expect(res.status.calledWith(500)).to.be.true;
            expect(res.json.calledWith(sinon.match.has('error'))).to.be.true;
        });
    });

    describe('updateArea', () => {
        it('Debería actualizar un área existente y registrar auditoría', async () => {
            const req = { params: { id: 1 }, body: { city: 'Ciudad Y', area: 150 }, user: { id: 999 } };
            const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
            const areaMock = { id: 1, city: 'Ciudad X', area: 100, update: sinon.stub().resolves() };
            sinon.stub(Area, 'findByPk').resolves(areaMock);
            sinon.stub(AuditLog, 'create').resolves(); // Simula el registro de auditoría

            await areaController.updateArea(req, res);

            expect(areaMock.update.calledWith(req.body)).to.be.true;
            expect(res.status.calledWith(200)).to.be.true;
            expect(res.json.calledWith(sinon.match.has('data'))).to.be.true;
            expect(AuditLog.create.calledOnce).to.be.true; // Verifica que la auditoría se haya registrado
        });

        it('Debería devolver un error si el área no existe', async () => {
            const req = { params: { id: 999 }, body: { city: 'Ciudad Y', area: 150 } };
            const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
            sinon.stub(Area, 'findByPk').resolves(null);

            await areaController.updateArea(req, res);

            expect(res.status.calledWith(404)).to.be.true;
            expect(res.json.calledWith(sinon.match.has('error'))).to.be.true;
        });

        it('Debería devolver un error si ocurre un problema en la actualización', async () => {
            const req = { params: { id: 1 }, body: { city: 'Ciudad Y', area: 150 } };
            const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
            const areaMock = { id: 1, city: 'Ciudad X', area: 100, update: sinon.stub().throws(new Error('Update error')) };
            sinon.stub(Area, 'findByPk').resolves(areaMock);

            await areaController.updateArea(req, res);

            expect(res.status.calledWith(500)).to.be.true;
            expect(res.json.calledWith(sinon.match.has('error'))).to.be.true;
        });
    });

    describe('deleteArea', () => {
        it('Debería eliminar un área por su ID y registrar auditoría', async () => {
            const req = { params: { id: 1 }, user: { id: 999 } };
            const res = { status: sinon.stub().returnsThis(), send: sinon.stub() };
            sinon.stub(Area, 'findByPk').resolves({ destroy: sinon.stub().resolves() });
            sinon.stub(AuditLog, 'create').resolves(); // Simula el registro de auditoría

            await areaController.deleteArea(req, res);

            expect(res.status.calledWith(204)).to.be.true;
            expect(AuditLog.create.calledOnce).to.be.true; // Verifica que la auditoría se haya registrado
        });

        it('Debería devolver un error si el área no existe', async () => {
            const req = { params: { id: 999 } };
            const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
            sinon.stub(Area, 'findByPk').resolves(null);

            await areaController.deleteArea(req, res);

            expect(res.status.calledWith(404)).to.be.true;
            expect(res.json.calledWith(sinon.match.has('error'))).to.be.true;
        });

        it('Debería devolver un error si ocurre un problema en la eliminación', async () => {
            const req = { params: { id: 1 } };
            const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
            const areaMock = { destroy: sinon.stub().throws(new Error('Delete error')) };
            sinon.stub(Area, 'findByPk').resolves(areaMock);

            await areaController.deleteArea(req, res);

            expect(res.status.calledWith(500)).to.be.true;
            expect(res.json.calledWith(sinon.match.has('error'))).to.be.true;
        });
    });
});
