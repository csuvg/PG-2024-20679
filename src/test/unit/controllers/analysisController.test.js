const chai = require('chai');
const sinon = require('sinon');
const analysisController = require('../../../analysis/analysisController');
const { expect } = chai;

const queries = require('../../../analysis/queries/userWasteAnalysis');

// Función para crear mock de res.status y res.json
const createResponseMock = () => ({
    status: sinon.stub().returnsThis(),
    json: sinon.stub(),
});

// Función para configurar mocks de sequelize
const setupMockQuery = (resultMock) => ({
    query: sinon.stub().resolves(resultMock),
});

describe('Analysis Controller', () => {
    let sequelizeMock;

    beforeEach(() => {
        sequelizeMock = {
            query: sinon.stub(),  // Simular el método query de sequelize
        };
    });

    afterEach(() => {
        sinon.restore();  // Restores all mocks and stubs after each test
    });

    describe('getRecyclableWasteStats', () => {
        it('Debería devolver estadísticas de desechos reciclables y no reciclables', async () => {
            const resultMock = [{ recyclable_weight: 10, non_recyclable_weight: 5 }];
            sequelizeMock = setupMockQuery(resultMock);  // Mock setup antes de la solicitud

            const req = { 
                params: { userId: 1 }, 
                app: { locals: { sequelize: sequelizeMock } }  // Simular req.app.locals.sequelize 
            };
            const res = createResponseMock();

            await analysisController.getRecyclableWasteStats(req, res);

            expect(res.status.calledWith(200)).to.be.true;
            expect(res.json.calledWith({
                recyclable_weight: 10,
                non_recyclable_weight: 5,
            })).to.be.true;
        });

        it('Debería devolver 0 si no se encuentran registros de desechos reciclables o no reciclables', async () => {
            sequelizeMock = setupMockQuery([{ recyclable_weight: null, non_recyclable_weight: null }]);

            const req = { 
                params: { userId: 1 }, 
                app: { locals: { sequelize: sequelizeMock } }  // Simular req.app.locals.sequelize 
            };
            const res = createResponseMock();

            await analysisController.getRecyclableWasteStats(req, res);

            expect(res.status.calledWith(200)).to.be.true;
            expect(res.json.calledWith({
                recyclable_weight: 0,
                non_recyclable_weight: 0,
            })).to.be.true;
        });

        it('Debería devolver un error si ocurre un problema en el proceso', async () => {
            const req = { 
                params: { userId: 1 }, 
                app: { locals: { sequelize: sequelizeMock } }  // Simular req.app.locals.sequelize 
            };
            const res = createResponseMock();
            sequelizeMock.query.throws(new Error('Database error'));

            await analysisController.getRecyclableWasteStats(req, res);

            expect(res.status.calledWith(500)).to.be.true;
            expect(res.json.calledWith(sinon.match.has('error'))).to.be.true;
        });

        it('Debería devolver un error 400 si falta el userId', async () => {
            const req = { params: {}, app: { locals: { sequelize: sequelizeMock } } };
            const res = createResponseMock();

            await analysisController.getRecyclableWasteStats(req, res);

            expect(res.status.calledWith(400)).to.be.true;
            expect(res.json.calledWith({ error: 'User ID is required' })).to.be.true;
        });
    });

    describe('getTop5LocationsByWaste', () => {
        it('Debería devolver las 5 ubicaciones principales con más cantidad de basura registrada', async () => {
            const resultMock = [{ location_name: 'Loc1', total_weight: 50 }];
            sequelizeMock = setupMockQuery(resultMock);  // Mock setup antes de la solicitud

            const req = { 
                params: { userId: 1 }, 
                app: { locals: { sequelize: sequelizeMock } }  // Simular req.app.locals.sequelize 
            };
            const res = createResponseMock();

            await analysisController.getTop5LocationsByWaste(req, res);

            expect(res.status.calledWith(200)).to.be.true;
            expect(res.json.calledWith(resultMock)).to.be.true;
        });

        it('Debería devolver una lista vacía si no se encuentran registros', async () => {
            sequelizeMock = setupMockQuery([]);  // Mock setup antes de la solicitud

            const req = { 
                params: { userId: 1 }, 
                app: { locals: { sequelize: sequelizeMock } }  // Simular req.app.locals.sequelize 
            };
            const res = createResponseMock();

            await analysisController.getTop5LocationsByWaste(req, res);

            expect(res.status.calledWith(200)).to.be.true;
            expect(res.json.calledWith([{ location_name: 'N/A', total_weight: 0 }])).to.be.true;
        });

        it('Debería devolver un error si ocurre un problema en el proceso', async () => {
            const req = { 
                params: { userId: 1 }, 
                app: { locals: { sequelize: sequelizeMock } }  // Simular req.app.locals.sequelize 
            };
            const res = createResponseMock();
            sequelizeMock.query.throws(new Error('Database error'));

            await analysisController.getTop5LocationsByWaste(req, res);

            expect(res.status.calledWith(500)).to.be.true;
            expect(res.json.calledWith(sinon.match.has('error'))).to.be.true;
        });

        it('Debería devolver un error 400 si falta el userId', async () => {
            const req = { params: {}, app: { locals: { sequelize: sequelizeMock } } };
            const res = createResponseMock();

            await analysisController.getTop5LocationsByWaste(req, res);

            expect(res.status.calledWith(400)).to.be.true;
            expect(res.json.calledWith({ error: 'User ID is required' })).to.be.true;
        });
    });

    describe('getWaterSavings', () => {
        it('Debería devolver el ahorro de agua del usuario', async () => {
            const resultMock = [{ total_water_savings: 100 }];
            sequelizeMock = setupMockQuery(resultMock);  // Mock setup antes de la solicitud
            
            const req = { 
                params: { userId: 1 }, 
                app: { locals: { sequelize: sequelizeMock } }  // Simular req.app.locals.sequelize 
            };
            const res = createResponseMock();
        
            await analysisController.getWaterSavings(req, res);
        
            expect(res.status.calledWith(200)).to.be.true;
            expect(res.json.calledWith({ water_savings: 100 })).to.be.true;
        });

        it('Debería devolver 0 si no hay ahorro de agua', async () => {
            sequelizeMock = setupMockQuery([{ total_water_savings: null }]);  // Mock setup antes de la solicitud

            const req = { 
                params: { userId: 1 }, 
                app: { locals: { sequelize: sequelizeMock } }  // Simular req.app.locals.sequelize 
            };
            const res = createResponseMock();

            await analysisController.getWaterSavings(req, res);

            expect(res.status.calledWith(200)).to.be.true;
            expect(res.json.calledWith({ water_savings: 0 })).to.be.true;
        });

        it('Debería devolver un error si ocurre un problema en el proceso', async () => {
            const req = { 
                params: { userId: 1 }, 
                app: { locals: { sequelize: sequelizeMock } }  // Simular req.app.locals.sequelize 
            };
            const res = createResponseMock();
            sequelizeMock.query.throws(new Error('Database error'));

            await analysisController.getWaterSavings(req, res);

            expect(res.status.calledWith(500)).to.be.true;
            expect(res.json.calledWith(sinon.match.has('error'))).to.be.true;
        });
    });

    describe('getCO2Savings', () => {
        it('Debería devolver el ahorro de CO2 del usuario', async () => {
            const resultMock = [{ total_co2_savings: 50 }];
            sequelizeMock = setupMockQuery(resultMock);  // Mock setup antes de la solicitud
            
            const req = { 
                params: { userId: 1 }, 
                app: { locals: { sequelize: sequelizeMock } }  // Simular req.app.locals.sequelize 
            };
            const res = createResponseMock();

            await analysisController.getCO2Savings(req, res);

            expect(res.status.calledWith(200)).to.be.true;
            expect(res.json.calledWith({ co2_savings: 50 })).to.be.true;
        });

        it('Debería devolver 0 si no hay ahorro de CO2', async () => {
            sequelizeMock = setupMockQuery([{ total_co2_savings: null }]);  // Mock setup antes de la solicitud

            const req = { 
                params: { userId: 1 }, 
                app: { locals: { sequelize: sequelizeMock } }  // Simular req.app.locals.sequelize 
            };
            const res = createResponseMock();

            await analysisController.getCO2Savings(req, res);

            expect(res.status.calledWith(200)).to.be.true;
            expect(res.json.calledWith({ co2_savings: 0 })).to.be.true;
        });

        it('Debería devolver un error si ocurre un problema en el proceso', async () => {
            const req = { 
                params: { userId: 1 }, 
                app: { locals: { sequelize: sequelizeMock } }  // Simular req.app.locals.sequelize 
            };
            const res = createResponseMock();
            sequelizeMock.query.throws(new Error('Database error'));

            await analysisController.getCO2Savings(req, res);

            expect(res.status.calledWith(500)).to.be.true;
            expect(res.json.calledWith(sinon.match.has('error'))).to.be.true;
        });
    });

    describe('getWasteWeightLast7Days', () => {
        it('Debería devolver la cantidad de basura ingresada en los últimos 7 días', async () => {
            const resultMock = [{ day_month: '01/10', total_weight: 50 }];
            sequelizeMock = setupMockQuery(resultMock);  // Mock setup antes de la solicitud

            const req = { 
                params: { userId: 1 }, 
                app: { locals: { sequelize: sequelizeMock } }  // Simular req.app.locals.sequelize 
            };
            const res = createResponseMock();

            await analysisController.getWasteWeightLast7Days(req, res);

            expect(res.status.calledWith(200)).to.be.true;
            expect(res.json.calledWith(resultMock)).to.be.true;
        });

        it('Debería devolver una lista vacía si no se encuentran registros', async () => {
            sequelizeMock = setupMockQuery([]);  // Mock setup antes de la solicitud

            const req = { 
                params: { userId: 1 }, 
                app: { locals: { sequelize: sequelizeMock } }  // Simular req.app.locals.sequelize 
            };
            const res = createResponseMock();

            await analysisController.getWasteWeightLast7Days(req, res);

            expect(res.status.calledWith(200)).to.be.true;
            expect(res.json.calledWith([{ day_month: 'N/A', total_weight: 0 }])).to.be.true;
        });

        it('Debería devolver un error si ocurre un problema en el proceso', async () => {
            const req = { 
                params: { userId: 1 }, 
                app: { locals: { sequelize: sequelizeMock } }  // Simular req.app.locals.sequelize 
            };
            const res = createResponseMock();
            sequelizeMock.query.throws(new Error('Database error'));

            await analysisController.getWasteWeightLast7Days(req, res);

            expect(res.status.calledWith(500)).to.be.true;
            expect(res.json.calledWith(sinon.match.has('error'))).to.be.true;
        });
    });

    describe('compareWasteTodayWithMonthlyAverage', () => {
        it('Debería devolver la comparación entre el promedio diario del mes y la cantidad de basura desechada hoy', async () => {
            const resultMock = [{ daily_average: 5, total_today: 3 }];
            sequelizeMock = setupMockQuery(resultMock);  // Mock setup antes de la solicitud
            
            const req = { 
                params: { userId: 1 }, 
                app: { locals: { sequelize: sequelizeMock } }  // Simular req.app.locals.sequelize 
            };
            const res = createResponseMock();

            await analysisController.compareWasteTodayWithMonthlyAverage(req, res);

            expect(res.status.calledWith(200)).to.be.true;
            expect(res.json.calledWith({
                daily_average: 5,
                waste_today: 3,
                percentage_difference: '40.00'
            })).to.be.true;
        });

        it('Debería devolver un mensaje cuando no hay datos suficientes para calcular el promedio', async () => {
            sequelizeMock = setupMockQuery([{ daily_average: 0, total_today: 0 }]);  // Mock setup antes de la solicitud

            const req = { 
                params: { userId: 1 }, 
                app: { locals: { sequelize: sequelizeMock } }  // Simular req.app.locals.sequelize 
            };
            const res = createResponseMock();

            await analysisController.compareWasteTodayWithMonthlyAverage(req, res);

            expect(res.status.calledWith(200)).to.be.true;
            expect(res.json.calledWith({
                message: 'No data from last month to calculate the daily average.'
            })).to.be.true;
        });

        it('Debería devolver un error si ocurre un problema en el proceso', async () => {
            const req = { 
                params: { userId: 1 }, 
                app: { locals: { sequelize: sequelizeMock } }  // Simular req.app.locals.sequelize 
            };
            const res = createResponseMock();
            sequelizeMock.query.throws(new Error('Database error'));

            await analysisController.compareWasteTodayWithMonthlyAverage(req, res);

            expect(res.status.calledWith(500)).to.be.true;
            expect(res.json.calledWith(sinon.match.has('error'))).to.be.true;
        });
    });

    describe('getWasteToday', () => {
        it('Debería devolver la cantidad de basura desechada hoy', async () => {
            const resultMock = [{ total_today: 10 }];
            sequelizeMock = setupMockQuery(resultMock);  // Mock setup antes de la solicitud

            const req = { 
                params: { userId: 1 }, 
                app: { locals: { sequelize: sequelizeMock } }  // Simular req.app.locals.sequelize 
            };
            const res = createResponseMock();

            await analysisController.getWasteToday(req, res);

            expect(res.status.calledWith(200)).to.be.true;
            expect(res.json.calledWith({ waste_today: 10 })).to.be.true;
        });

        it('Debería devolver 0 si no hay registros de basura desechada hoy', async () => {
            sequelizeMock = setupMockQuery([{ total_today: null }]);  // Mock setup antes de la solicitud

            const req = { 
                params: { userId: 1 }, 
                app: { locals: { sequelize: sequelizeMock } }  // Simular req.app.locals.sequelize 
            };
            const res = createResponseMock();

            await analysisController.getWasteToday(req, res);

            expect(res.status.calledWith(200)).to.be.true;
            expect(res.json.calledWith({ waste_today: 0 })).to.be.true;
        });

        it('Debería devolver un error si ocurre un problema en el proceso', async () => {
            const req = { 
                params: { userId: 1 }, 
                app: { locals: { sequelize: sequelizeMock } }  // Simular req.app.locals.sequelize 
            };
            const res = createResponseMock();
            sequelizeMock.query.throws(new Error('Database error'));

            await analysisController.getWasteToday(req, res);

            expect(res.status.calledWith(500)).to.be.true;
            expect(res.json.calledWith(sinon.match.has('error'))).to.be.true;
        });
    });
});
