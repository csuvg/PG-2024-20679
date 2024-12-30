// test/integration/routes/analysisRoutes.test.js
const chai = require('chai');
const sinon = require('sinon');
const request = require('supertest');
const express = require('express');
const analysisRoutes = require('../../../routes/analysisRoutes');
const { expect } = chai;

// Simular las queries de Sequelize
const queries = require('../../../analysis/queries/userWasteAnalysis');

describe('Analysis Routes', () => {
    let app;
    let sequelizeMock;

    beforeEach(() => {
        app = express();
        app.use(express.json());
        app.use('/api/analysis', analysisRoutes);

        sequelizeMock = {
            query: sinon.stub() // Simular el método query de Sequelize
        };

        // Asegúrate de que sequelize esté disponible en app.locals
        app.locals.sequelize = sequelizeMock;
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('GET /api/analysis/recyclable-waste/:userId', () => {
        it('Debería devolver las estadísticas de desechos reciclables', async () => {
            const userId = 1;
            const resultMock = [{ recyclable_weight: 10, non_recyclable_weight: 5 }];

            // Simula la query de sequelize
            sequelizeMock.query.resolves(resultMock);

            const res = await request(app).get(`/api/analysis/recyclable-waste/${userId}`);
            
            expect(res.status).to.equal(200);
            expect(res.body).to.deep.equal({
                recyclable_weight: 10,
                non_recyclable_weight: 5
            });
        });

        it('Debería devolver un error 500 si ocurre un problema en el proceso', async () => {
            const userId = 1;
            sequelizeMock.query.throws(new Error('Database error'));

            const res = await request(app).get(`/api/analysis/recyclable-waste/${userId}`);
            
            expect(res.status).to.equal(500);
            expect(res.body).to.deep.equal({ error: 'Internal Server Error' });
        });
    });

    describe('GET /api/analysis/top5-locations/:userId', () => {
        it('Debería devolver las 5 ubicaciones principales con más cantidad de basura registrada', async () => {
            const userId = 1;
            const resultMock = [{ location_name: 'Loc1', total_weight: 50 }];

            sequelizeMock.query.resolves(resultMock);

            const res = await request(app).get(`/api/analysis/top5-locations/${userId}`);
            
            expect(res.status).to.equal(200);
            expect(res.body).to.deep.equal(resultMock);
        });

        it('Debería devolver una lista vacía si no se encuentran registros', async () => {
            const userId = 1;
            sequelizeMock.query.resolves([]);

            const res = await request(app).get(`/api/analysis/top5-locations/${userId}`);
            
            expect(res.status).to.equal(200);
            expect(res.body).to.deep.equal([{ location_name: 'N/A', total_weight: 0 }]);
        });

        it('Debería devolver un error 500 si ocurre un problema en el proceso', async () => {
            const userId = 1;
            sequelizeMock.query.throws(new Error('Database error'));

            const res = await request(app).get(`/api/analysis/top5-locations/${userId}`);
            
            expect(res.status).to.equal(500);
            expect(res.body).to.deep.equal({ error: 'Internal Server Error' });
        });
    });

    describe('GET /api/analysis/water-savings/:userId', () => {
        it('Debería devolver el ahorro de agua del usuario', async () => {
            const userId = 1;
            const resultMock = [{ total_water_savings: 100 }];

            sequelizeMock.query.resolves(resultMock);

            const res = await request(app).get(`/api/analysis/water-savings/${userId}`);
            
            expect(res.status).to.equal(200);
            expect(res.body).to.deep.equal({ water_savings: 100 });
        });

        it('Debería devolver 0 si no hay ahorro de agua', async () => {
            const userId = 1;
            sequelizeMock.query.resolves([{ total_water_savings: null }]);

            const res = await request(app).get(`/api/analysis/water-savings/${userId}`);
            
            expect(res.status).to.equal(200);
            expect(res.body).to.deep.equal({ water_savings: 0 });
        });

        it('Debería devolver un error 500 si ocurre un problema en el proceso', async () => {
            const userId = 1;
            sequelizeMock.query.throws(new Error('Database error'));

            const res = await request(app).get(`/api/analysis/water-savings/${userId}`);
            
            expect(res.status).to.equal(500);
            expect(res.body).to.deep.equal({ error: 'Internal Server Error' });
        });
    });

    describe('GET /api/analysis/co2-savings/:userId', () => {
        it('Debería devolver el ahorro de CO2 del usuario', async () => {
            const userId = 1;
            const resultMock = [{ total_co2_savings: 50 }];

            sequelizeMock.query.resolves(resultMock);

            const res = await request(app).get(`/api/analysis/co2-savings/${userId}`);
            
            expect(res.status).to.equal(200);
            expect(res.body).to.deep.equal({ co2_savings: 50 });
        });

        it('Debería devolver 0 si no hay ahorro de CO2', async () => {
            const userId = 1;
            sequelizeMock.query.resolves([{ total_co2_savings: null }]);

            const res = await request(app).get(`/api/analysis/co2-savings/${userId}`);
            
            expect(res.status).to.equal(200);
            expect(res.body).to.deep.equal({ co2_savings: 0 });
        });

        it('Debería devolver un error 500 si ocurre un problema en el proceso', async () => {
            const userId = 1;
            sequelizeMock.query.throws(new Error('Database error'));

            const res = await request(app).get(`/api/analysis/co2-savings/${userId}`);
            
            expect(res.status).to.equal(500);
            expect(res.body).to.deep.equal({ error: 'Internal Server Error' });
        });
    });

    describe('GET /api/analysis/waste-last7days/:userId', () => {
        it('Debería devolver la cantidad de basura ingresada en los últimos 7 días', async () => {
            const userId = 1;
            const resultMock = [{ day_month: '01/10', total_weight: 50 }];

            sequelizeMock.query.resolves(resultMock);

            const res = await request(app).get(`/api/analysis/waste-last7days/${userId}`);
            
            expect(res.status).to.equal(200);
            expect(res.body).to.deep.equal(resultMock);
        });

        it('Debería devolver una lista vacía si no se encuentran registros', async () => {
            const userId = 1;
            sequelizeMock.query.resolves([]);

            const res = await request(app).get(`/api/analysis/waste-last7days/${userId}`);
            
            expect(res.status).to.equal(200);
            expect(res.body).to.deep.equal([{ day_month: 'N/A', total_weight: 0 }]);
        });

        it('Debería devolver un error 500 si ocurre un problema en el proceso', async () => {
            const userId = 1;
            sequelizeMock.query.throws(new Error('Database error'));

            const res = await request(app).get(`/api/analysis/waste-last7days/${userId}`);
            
            expect(res.status).to.equal(500);
            expect(res.body).to.deep.equal({ error: 'Internal Server Error' });
        });
    });

    describe('GET /api/analysis/compare-waste-today/:userId', () => {
        // VERIFICAR ESTE TEST
        // it('Debería devolver la comparación entre el promedio diario del mes y la cantidad de basura desechada hoy', async () => {
        //     const userId = 1;
        //     const dailyAverageMock = 5;  // Promedio diario simulado
        //     const wasteTodayMock = 3;  // Basura desechada hoy simulada
    
        //     // Simula las consultas para el promedio diario y la basura desechada hoy
        //     sinon.stub(queries, 'getDailyAverageWasteLastMonthQuery').resolves(dailyAverageMock);
        //     sinon.stub(queries, 'getWasteTodayQuery').resolves(wasteTodayMock);
    
        //     const res = await request(app).get(`/api/analysis/compare-waste-today/${userId}`);
    
        //     // Verifica que el código de estado y los datos devueltos sean correctos
        //     expect(res.status).to.equal(200);
        //     expect(res.body).to.deep.equal({
        //         daily_average: dailyAverageMock,
        //         waste_today: wasteTodayMock,
        //         percentage_difference: '40.00'
        //     });
        // });
    
        it('Debería devolver un mensaje cuando no hay suficientes datos para calcular el promedio', async () => {
            const userId = 1;
            const dailyAverageMock = 0;  // Simula que no hay suficientes datos
            const wasteTodayMock = 0;  // Simula que no se ha desechado basura hoy
    
            // Simula las respuestas de las consultas
            sequelizeMock.query.onFirstCall().resolves([[{ daily_average: dailyAverageMock }]]);  // Simula que no hay promedio diario
            sequelizeMock.query.onSecondCall().resolves([[{ waste_today: wasteTodayMock }]]);  // Simula que no hay basura desechada hoy
    
            const res = await request(app).get(`/api/analysis/compare-waste-today/${userId}`);
    
            // Verifica el código de estado y el mensaje devuelto
            expect(res.status).to.equal(200);
            expect(res.body).to.deep.equal({
                message: 'No data from last month to calculate the daily average.'
            });
        });

        it('Debería devolver un error 500 si ocurre un problema en el proceso', async () => {
            const userId = 1;
            sequelizeMock.query.throws(new Error('Database error'));

            const res = await request(app).get(`/api/analysis/compare-waste-today/${userId}`);
            
            expect(res.status).to.equal(500);
            expect(res.body).to.deep.equal({ error: 'Internal Server Error' });
        });
    });

    describe('GET /api/analysis/waste-today/:userId', () => {
        it('Debería devolver la cantidad de basura desechada hoy', async () => {
            const userId = 1;
            const resultMock = [{ total_today: 10 }];

            sequelizeMock.query.resolves(resultMock);

            const res = await request(app).get(`/api/analysis/waste-today/${userId}`);
            
            expect(res.status).to.equal(200);
            expect(res.body).to.deep.equal({ waste_today: 10 });
        });

        it('Debería devolver 0 si no hay registros de basura desechada hoy', async () => {
            const userId = 1;
            sequelizeMock.query.resolves([{ total_today: null }]);

            const res = await request(app).get(`/api/analysis/waste-today/${userId}`);
            
            expect(res.status).to.equal(200);
            expect(res.body).to.deep.equal({ waste_today: 0 });
        });

        it('Debería devolver un error 500 si ocurre un problema en el proceso', async () => {
            const userId = 1;
            sequelizeMock.query.throws(new Error('Database error'));

            const res = await request(app).get(`/api/analysis/waste-today/${userId}`);
            
            expect(res.status).to.equal(500);
            expect(res.body).to.deep.equal({ error: 'Internal Server Error' });
        });
    });
});
