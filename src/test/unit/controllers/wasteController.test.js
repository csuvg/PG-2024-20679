// test/unit/controllers/wasteController.test.js
const chai = require('chai');
const sinon = require('sinon');
const wasteController = require('../../../controllers/wasteController');
const Waste = require('../../../models/Waste');
const WasteType = require('../../../models/WasteType');
const AuditLog = require('../../../models/AuditLog'); // Importar el modelo de auditoría
const { expect } = chai;

// Función de utilidad para crear un mock de `res`
const createMockResponse = () => ({
    status: sinon.stub().returnsThis(),
    json: sinon.stub(),
    send: sinon.stub(),
});

describe('Waste Controller', () => {
    afterEach(() => {
        sinon.restore(); // Restaurar stubs después de cada prueba
    });

    describe('createWaste', () => {
        it('Debería crear un nuevo Waste y registrar auditoría', async () => {
            const req = { 
                body: { waste_type_id: 1, is_recyclable: true, average_weight: 10 },
                user: { id: 999 } // Agregamos el ID del usuario para la auditoría
            };
            const res = createMockResponse();
            const wasteMock = { id: 1, is_recyclable: true };

            sinon.stub(WasteType, 'findByPk').resolves({ id: 1 });
            sinon.stub(Waste, 'create').resolves(wasteMock);
            sinon.stub(AuditLog, 'create').resolves(); // Simulamos la creación de la auditoría

            await wasteController.createWaste(req, res);

            expect(res.status.calledWith(201)).to.be.true;
            expect(res.json.calledWith(sinon.match.has('data'))).to.be.true;
            expect(AuditLog.create.calledOnce).to.be.true;
            expect(AuditLog.create.calledWith(sinon.match({
                operation_type: 'CREATE',
                table_name: 'waste',
                record_id: wasteMock.id,
                performed_by: req.user.id
            }))).to.be.true;
        });

        it('Debería devolver un error si faltan datos', async () => {
            const req = { body: { is_recyclable: true } }; // Faltan datos
            const res = createMockResponse();

            await wasteController.createWaste(req, res);

            expect(res.status.calledWith(400)).to.be.true;
            expect(res.json.calledWith(sinon.match.has('error'))).to.be.true;
        });

        it('Debería devolver un error si ocurre un problema con la base de datos', async () => {
            const req = { 
                body: { waste_type_id: 1, is_recyclable: true, average_weight: 10 },
                user: { id: 999 }
            };
            const res = createMockResponse();

            sinon.stub(WasteType, 'findByPk').throws(new Error('Database error'));

            await wasteController.createWaste(req, res);

            expect(res.status.calledWith(500)).to.be.true;
            expect(res.json.calledWith(sinon.match.has('error'))).to.be.true;
        });
    });

    describe('getWaste', () => {
        it('Debería obtener un Waste por su ID', async () => {
            const req = { params: { id: 1 } };
            const res = createMockResponse();
            const wasteMock = { id: 1, is_recyclable: true };

            sinon.stub(Waste, 'findByPk').resolves(wasteMock);

            await wasteController.getWaste(req, res);

            expect(res.status.calledWith(200)).to.be.true;
            expect(res.json.calledWith(sinon.match.has('data'))).to.be.true;
        });

        it('Debería devolver un error si el Waste no existe', async () => {
            const req = { params: { id: 999 } };
            const res = createMockResponse();

            sinon.stub(Waste, 'findByPk').resolves(null);

            await wasteController.getWaste(req, res);

            expect(res.status.calledWith(404)).to.be.true;
            expect(res.json.calledWith(sinon.match.has('error'))).to.be.true;
        });

        it('Debería devolver un error si ocurre un problema con la base de datos', async () => {
            const req = { params: { id: 1 } };
            const res = createMockResponse();

            sinon.stub(Waste, 'findByPk').throws(new Error('Database error'));

            await wasteController.getWaste(req, res);

            expect(res.status.calledWith(500)).to.be.true;
            expect(res.json.calledWith(sinon.match.has('error'))).to.be.true;
        });
    });

    describe('updateWaste', () => {
        it('Debería actualizar un Waste y registrar auditoría', async () => {
            const req = {
                params: { id: 1 },
                body: { waste_type_id: 1, is_recyclable: false, average_weight: 20 },
                user: { id: 999 } 
            };
            const res = createMockResponse();
            const wasteMock = { id: 1, is_recyclable: true, update: sinon.stub().resolves(), dataValues: { is_recyclable: true } };
        
            sinon.stub(Waste, 'findByPk').resolves(wasteMock);
            sinon.stub(WasteType, 'findByPk').resolves({ id: 1 });
            sinon.stub(AuditLog, 'create').resolves();
        
            await wasteController.updateWaste(req, res);
        
            expect(wasteMock.update.calledWith(req.body)).to.be.true;
            expect(res.status.calledWith(200)).to.be.true;
            expect(res.json.calledWith(sinon.match.has('data'))).to.be.true;
            expect(AuditLog.create.calledOnce).to.be.true;
        });

        it('Debería devolver un error si el Waste no existe', async () => {
            const req = { params: { id: 999 }, body: { is_recyclable: false } };
            const res = createMockResponse();

            sinon.stub(Waste, 'findByPk').resolves(null);

            await wasteController.updateWaste(req, res);

            expect(res.status.calledWith(404)).to.be.true;
            expect(res.json.calledWith(sinon.match.has('error'))).to.be.true;
        });

        it('Debería devolver un error si ocurre un problema con la base de datos', async () => {
            const req = { params: { id: 1 }, body: { is_recyclable: false }, user: { id: 999 } };
            const res = createMockResponse();

            sinon.stub(Waste, 'findByPk').throws(new Error('Database error'));

            await wasteController.updateWaste(req, res);

            expect(res.status.calledWith(500)).to.be.true;
            expect(res.json.calledWith(sinon.match.has('error'))).to.be.true;
        });
    });

    describe('deleteWaste', () => {
        it('Debería eliminar un Waste y registrar auditoría', async () => {
            const req = { params: { id: 1 }, user: { id: 999 } };
            const res = createMockResponse();
            const wasteMock = { id: 1, destroy: sinon.stub().resolves(), dataValues: { is_recyclable: true } };

            sinon.stub(Waste, 'findByPk').resolves(wasteMock);
            sinon.stub(AuditLog, 'create').resolves();

            await wasteController.deleteWaste(req, res);

            expect(wasteMock.destroy.calledOnce).to.be.true;
            expect(res.status.calledWith(204)).to.be.true;
            expect(AuditLog.create.calledOnce).to.be.true;
        });

        it('Debería devolver un error si el Waste no existe', async () => {
            const req = { params: { id: 999 }, user: { id: 999 } };
            const res = createMockResponse();

            sinon.stub(Waste, 'findByPk').resolves(null);

            await wasteController.deleteWaste(req, res);

            expect(res.status.calledWith(404)).to.be.true;
            expect(res.json.calledWith(sinon.match.has('error'))).to.be.true;
        });

        it('Debería devolver un error si ocurre un problema con la base de datos', async () => {
            const req = { params: { id: 1 }, user: { id: 999 } };
            const res = createMockResponse();

            sinon.stub(Waste, 'findByPk').throws(new Error('Database error'));

            await wasteController.deleteWaste(req, res);

            expect(res.status.calledWith(500)).to.be.true;
            expect(res.json.calledWith(sinon.match.has('error'))).to.be.true;
        });
    });
});
