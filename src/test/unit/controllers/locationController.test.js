const chai = require('chai');
const sinon = require('sinon');
const locationController = require('../../../controllers/locationController');
const Location = require('../../../models/Location');
const User = require('../../../models/User');
const Area = require('../../../models/Area');
const AuditLog = require('../../../models/AuditLog');
const { expect } = chai;

describe('Location Controller', () => {
    afterEach(() => {
        sinon.restore(); // Restores all stubs and mocks after each test
    });

    describe('saveLocation', () => {
        it('Debería guardar una nueva ubicación y registrar auditoría correctamente', async () => {
            const req = { body: { user_id: 1, name: 'Home', area_id: 1, has_waste_collection: 'Yes' }, user: { id: 999 } };
            const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
            const locationMock = { id: 1, name: 'Home', has_waste_collection: 'Yes' };
            
            sinon.stub(User, 'findByPk').resolves({ id: 1 });
            sinon.stub(Area, 'findByPk').resolves({ id: 1 });
            sinon.stub(Location, 'create').resolves(locationMock);
            sinon.stub(AuditLog, 'create').resolves();

            await locationController.saveLocation(req, res);

            expect(res.status.calledWith(201)).to.be.true;
            expect(res.json.calledWith(sinon.match.has('data'))).to.be.true;
            expect(AuditLog.create.calledOnce).to.be.true;
        });

        it('Debería manejar los casos en que faltan datos obligatorios', async () => {
            const req = { body: { user_id: 1, name: '' } };
            const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };

            await locationController.saveLocation(req, res);

            expect(res.status.calledWith(400)).to.be.true;
            expect(res.json.calledWith(sinon.match.has('error'))).to.be.true;
        });

        it('Debería manejar cuando el usuario no existe', async () => {
            const req = { body: { user_id: 999, name: 'Home', area_id: 1, has_waste_collection: 'Yes' } };
            const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
            sinon.stub(User, 'findByPk').resolves(null);

            await locationController.saveLocation(req, res);

            expect(res.status.calledWith(404)).to.be.true;
            expect(res.json.calledWith(sinon.match.has('error'))).to.be.true;
        });

        it('Debería manejar cuando el área no existe', async () => {
            const req = { body: { user_id: 1, name: 'Home', area_id: 999, has_waste_collection: 'Yes' } };
            const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
            sinon.stub(User, 'findByPk').resolves({ id: 1 });
            sinon.stub(Area, 'findByPk').resolves(null);

            await locationController.saveLocation(req, res);

            expect(res.status.calledWith(404)).to.be.true;
            expect(res.json.calledWith(sinon.match.has('error'))).to.be.true;
        });

        it('Debería manejar errores inesperados en la base de datos', async () => {
            const req = { body: { user_id: 1, name: 'Home', area_id: 1, has_waste_collection: 'Yes' } };
            const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
            
            sinon.stub(User, 'findByPk').throws(new Error('Database error'));

            await locationController.saveLocation(req, res);

            expect(res.status.calledWith(500)).to.be.true;
            expect(res.json.calledWith(sinon.match.has('error'))).to.be.true;
        });
    });

    describe('getLocation', () => {
        it('Debería devolver una ubicación existente por su ID', async () => {
            const req = { params: { id: 1 } };
            const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
            const locationMock = { id: 1, name: 'Home', has_waste_collection: 'Yes' };
            sinon.stub(Location, 'findByPk').resolves(locationMock);

            await locationController.getLocation(req, res);

            expect(res.status.calledWith(200)).to.be.true;
            expect(res.json.calledWith(sinon.match.has('data'))).to.be.true;
        });

        it('Debería manejar los casos en los que la ubicación no existe', async () => {
            const req = { params: { id: 999 } };
            const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
            sinon.stub(Location, 'findByPk').resolves(null);

            await locationController.getLocation(req, res);

            expect(res.status.calledWith(404)).to.be.true;
            expect(res.json.calledWith(sinon.match.has('error'))).to.be.true;
        });

        it('Debería manejar errores inesperados al obtener una ubicación', async () => {
            const req = { params: { id: 1 } };
            const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
            
            sinon.stub(Location, 'findByPk').throws(new Error('Database error'));

            await locationController.getLocation(req, res);

            expect(res.status.calledWith(500)).to.be.true;
            expect(res.json.calledWith(sinon.match.has('error'))).to.be.true;
        });
    });

    describe('getLocations', () => {
        it('Debería devolver todas las ubicaciones correctamente', async () => {
            const req = {};
            const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
            const locationsMock = [{ id: 1, name: 'Home' }];
            sinon.stub(Location, 'findAll').resolves(locationsMock);

            await locationController.getLocations(req, res);

            expect(res.status.calledWith(200)).to.be.true;
            expect(res.json.calledWith(sinon.match.has('data'))).to.be.true;
        });

        it('Debería manejar errores inesperados al recuperar las ubicaciones', async () => {
            const req = {};
            const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
            sinon.stub(Location, 'findAll').throws(new Error('Database error'));

            await locationController.getLocations(req, res);

            expect(res.status.calledWith(500)).to.be.true;
            expect(res.json.calledWith(sinon.match.has('error'))).to.be.true;
        });
    });

    describe('updateLocation', () => {
        it('Debería actualizar correctamente una ubicación existente', async () => {
            const req = { params: { id: 1 }, body: { name: 'Updated Location', has_waste_collection: 'No' }, user: { id: 999 } };
            const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
            const locationMock = { id: 1, name: 'Home', has_waste_collection: 'Yes', update: sinon.stub().resolves() };
            
            sinon.stub(Location, 'findByPk').resolves(locationMock);
            sinon.stub(AuditLog, 'create').resolves();

            await locationController.updateLocation(req, res);

            expect(locationMock.update.calledWith(req.body)).to.be.true;
            expect(res.status.calledWith(200)).to.be.true;
            expect(res.json.calledWith(sinon.match.has('data'))).to.be.true;
            expect(AuditLog.create.calledOnce).to.be.true;
        });

        it('Debería manejar los casos en que la ubicación no existe al intentar actualizar', async () => {
            const req = { params: { id: 999 }, body: { name: 'Updated Location' } };
            const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
            sinon.stub(Location, 'findByPk').resolves(null);

            await locationController.updateLocation(req, res);

            expect(res.status.calledWith(404)).to.be.true;
            expect(res.json.calledWith(sinon.match.has('error'))).to.be.true;
        });

        it('Debería manejar errores inesperados al intentar actualizar una ubicación', async () => {
            const req = { params: { id: 1 }, body: { name: 'Updated Location' }, user: { id: 999 } };
            const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
            
            sinon.stub(Location, 'findByPk').throws(new Error('Database error'));

            await locationController.updateLocation(req, res);

            expect(res.status.calledWith(500)).to.be.true;
            expect(res.json.calledWith(sinon.match.has('error'))).to.be.true;
        });
    });

    describe('deleteLocation', () => {
        it('Debería eliminar correctamente una ubicación existente y registrar auditoría', async () => {
            const req = { params: { id: 1 }, user: { id: 999 } };
            const res = { status: sinon.stub().returnsThis(), send: sinon.stub() };
            const locationMock = { id: 1, destroy: sinon.stub().resolves() };
            
            sinon.stub(Location, 'findByPk').resolves(locationMock);
            sinon.stub(AuditLog, 'create').resolves();

            await locationController.deleteLocation(req, res);

            expect(res.status.calledWith(204)).to.be.true;
            expect(AuditLog.create.calledOnce).to.be.true;
        });

        it('Debería manejar los casos en que la ubicación no existe al intentar eliminar', async () => {
            const req = { params: { id: 999 } };
            const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
            sinon.stub(Location, 'findByPk').resolves(null);

            await locationController.deleteLocation(req, res);

            expect(res.status.calledWith(404)).to.be.true;
            expect(res.json.calledWith(sinon.match.has('error'))).to.be.true;
        });

        it('Debería manejar errores inesperados al intentar eliminar una ubicación', async () => {
            const req = { params: { id: 1 }, user: { id: 999 } };
            const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
            
            sinon.stub(Location, 'findByPk').throws(new Error('Database error'));

            await locationController.deleteLocation(req, res);

            expect(res.status.calledWith(500)).to.be.true;
            expect(res.json.calledWith(sinon.match.has('error'))).to.be.true;
        });
    });
});
