const chai = require('chai');
const sinon = require('sinon');
const wasteTypeController = require('../../../controllers/wasteTypeController');
const WasteType = require('../../../models/WasteType');
const AuditLog = require('../../../models/AuditLog'); // Importar el modelo de auditoría
const { expect } = chai;

// Función de utilidad para crear un mock de `res`
const createMockResponse = () => ({
    status: sinon.stub().returnsThis(),
    json: sinon.stub(),
    send: sinon.stub(),
});

describe('WasteType Controller', () => {
    afterEach(() => {
        sinon.restore(); // Restaurar stubs después de cada prueba
    });

    describe('createWasteType', () => {
        it('Debería crear un nuevo WasteType y registrar auditoría', async () => {
            const req = { body: { type_name: 'Plastico', water_savings_index: 10, co2_emission_index: 5 }, user: { id: 999 } };
            const res = createMockResponse();
            const wasteTypeMock = { id: 1, type_name: 'Plastico' };

            sinon.stub(WasteType, 'create').resolves(wasteTypeMock);
            sinon.stub(AuditLog, 'create').resolves(); // Simula el registro de auditoría

            await wasteTypeController.createWasteType(req, res);

            expect(res.status.calledWith(201)).to.be.true;
            expect(res.json.calledWith(sinon.match.has('data'))).to.be.true;
            expect(AuditLog.create.calledOnce).to.be.true;
            expect(AuditLog.create.calledWith(sinon.match({
                operation_type: 'CREATE',
                table_name: 'waste_type',
                record_id: wasteTypeMock.id,
                performed_by: req.user.id
            }))).to.be.true; // Verifica parámetros correctos en la auditoría
        });

        it('Debería devolver un error si los datos de entrada son inválidos', async () => {
            const req = { body: { type_name: 'Plastico' }, user: { id: 999 } }; // Falta water_savings_index y co2_emission_index
            const res = createMockResponse();

            await wasteTypeController.createWasteType(req, res);

            expect(res.status.calledWith(400)).to.be.true;
            expect(res.json.calledWith(sinon.match.has('error'))).to.be.true;
        });

        it('Debería devolver un error si ocurre un problema con la base de datos', async () => {
            const req = { body: { type_name: 'Plastico', water_savings_index: 10, co2_emission_index: 5 }, user: { id: 999 } };
            const res = createMockResponse();

            sinon.stub(WasteType, 'create').throws(new Error('Database error'));

            await wasteTypeController.createWasteType(req, res);

            expect(res.status.calledWith(500)).to.be.true;
            expect(res.json.calledWith(sinon.match.has('error'))).to.be.true;
        });
    });

    describe('getWasteType', () => {
        it('Debería devolver un WasteType por su ID', async () => {
            const req = { params: { id: 1 }, user: { id: 999 } };
            const res = createMockResponse();
            const wasteTypeMock = { id: 1, type_name: 'Plastico' };

            sinon.stub(WasteType, 'findByPk').resolves(wasteTypeMock);

            await wasteTypeController.getWasteType(req, res);

            expect(res.status.calledWith(200)).to.be.true;
            expect(res.json.calledWith(sinon.match.has('data'))).to.be.true;
        });

        it('Debería devolver un error si el WasteType no existe', async () => {
            const req = { params: { id: 999 }, user: { id: 999 } };
            const res = createMockResponse();

            sinon.stub(WasteType, 'findByPk').resolves(null);

            await wasteTypeController.getWasteType(req, res);

            expect(res.status.calledWith(404)).to.be.true;
            expect(res.json.calledWith(sinon.match.has('error'))).to.be.true;
        });

        it('Debería devolver un error si ocurre un problema con la base de datos', async () => {
            const req = { params: { id: 1 }, user: { id: 999 } };
            const res = createMockResponse();

            sinon.stub(WasteType, 'findByPk').throws(new Error('Database error'));

            await wasteTypeController.getWasteType(req, res);

            expect(res.status.calledWith(500)).to.be.true;
            expect(res.json.calledWith(sinon.match.has('error'))).to.be.true;
        });
    });

    describe('updateWasteType', () => {
        it('Debería actualizar un WasteType existente y registrar auditoría', async () => {
            const req = {
                params: { id: 1 },
                body: { type_name: 'Metal', water_savings_index: 15 },
                user: { id: 999 }
            };
            const res = createMockResponse();
            
            const wasteTypeMock = {
                id: 1,
                type_name: 'Plastico',
                water_savings_index: 10,
                co2_emission_index: 5,
                update: sinon.stub().resolves(),
                dataValues: { type_name: 'Plastico', water_savings_index: 10, co2_emission_index: 5 }
            };
    
            sinon.stub(WasteType, 'findByPk').resolves(wasteTypeMock);
            sinon.stub(AuditLog, 'create').resolves(); // Simula el registro de auditoría
    
            await wasteTypeController.updateWasteType(req, res);
    
            expect(wasteTypeMock.update.calledWith({
                type_name: 'Metal',
                water_savings_index: 15,
                co2_emission_index: 5 // Mantener el valor previo
            })).to.be.true;

            expect(res.status.calledWith(200)).to.be.true;
            expect(res.json.calledWith(sinon.match.has('data'))).to.be.true;
    
            expect(AuditLog.create.calledOnce).to.be.true;
            expect(AuditLog.create.calledWith(sinon.match({
                operation_type: 'UPDATE',
                table_name: 'waste_type',
                record_id: wasteTypeMock.id,
                performed_by: req.user.id
            }))).to.be.true;
        });

        it('Debería devolver un error si el WasteType no existe', async () => {
            const req = { params: { id: 999 }, body: { type_name: 'Metal' }, user: { id: 999 } };
            const res = createMockResponse();

            sinon.stub(WasteType, 'findByPk').resolves(null);

            await wasteTypeController.updateWasteType(req, res);

            expect(res.status.calledWith(404)).to.be.true;
            expect(res.json.calledWith(sinon.match.has('error'))).to.be.true;
        });

        it('Debería devolver un error si ocurre un problema con la base de datos', async () => {
            const req = { params: { id: 1 }, body: { type_name: 'Metal', water_savings_index: 15 }, user: { id: 999 } };
            const res = createMockResponse();

            sinon.stub(WasteType, 'findByPk').throws(new Error('Database error'));

            await wasteTypeController.updateWasteType(req, res);

            expect(res.status.calledWith(500)).to.be.true;
            expect(res.json.calledWith(sinon.match.has('error'))).to.be.true;
        });
    });

    describe('deleteWasteType', () => {
        it('Debería eliminar un WasteType por su ID y registrar auditoría', async () => {
            const req = { params: { id: 1 }, user: { id: 999 } };
            const res = createMockResponse();
            const wasteTypeMock = { id: 1, destroy: sinon.stub().resolves(), dataValues: { type_name: 'Plastico' } };

            sinon.stub(WasteType, 'findByPk').resolves(wasteTypeMock);
            sinon.stub(AuditLog, 'create').resolves(); // Simula el registro de auditoría

            await wasteTypeController.deleteWasteType(req, res);

            expect(res.status.calledWith(204)).to.be.true;
            expect(AuditLog.create.calledOnce).to.be.true;
            expect(AuditLog.create.calledWith(sinon.match({
                operation_type: 'DELETE',
                table_name: 'waste_type',
                record_id: wasteTypeMock.id,
                performed_by: req.user.id
            }))).to.be.true; // Verificar que se registró la auditoría con los parámetros correctos
        });

        it('Debería devolver un error si el WasteType no existe', async () => {
            const req = { params: { id: 999 }, user: { id: 999 } };
            const res = createMockResponse();

            sinon.stub(WasteType, 'findByPk').resolves(null);

            await wasteTypeController.deleteWasteType(req, res);

            expect(res.status.calledWith(404)).to.be.true;
            expect(res.json.calledWith(sinon.match.has('error'))).to.be.true;
        });

        it('Debería devolver un error si ocurre un problema con la base de datos', async () => {
            const req = { params: { id: 1 }, user: { id: 999 } };
            const res = createMockResponse();

            sinon.stub(WasteType, 'findByPk').throws(new Error('Database error'));

            await wasteTypeController.deleteWasteType(req, res);

            expect(res.status.calledWith(500)).to.be.true;
            expect(res.json.calledWith(sinon.match.has('error'))).to.be.true;
        });
    });
});
