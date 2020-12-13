import * as dotenv from 'dotenv';
import figlet from 'figlet';
import chalk from 'chalk';
import { Command } from 'commander';
import { Sequelize } from "sequelize";

console.clear();

const command = new Command();
command
.version("1.0.0")
.usage("[options]")
.option("-v, --verbose", "Verbose mode", false)
.parse(process.argv);

figlet('Stargate: Galactic Commander', function(err, text) {
    if (err) {
        console.error(err);
        return;
    }

    console.log(text);

    let config = dotenv.config();
    if (config.error) {
        throw config.error.message;
    }
    console.log(`● Read environment config ${chalk.green('[✓]')}`);
    console.log(config.parsed);

    const DB_HOST = config.parsed?.DB_HOST;
    const DB_PORT = config.parsed?.DB_PORT;
    const DB_USER = config.parsed?.DB_USER;
    const DB_PASSWORD = config.parsed?.DB_PASSWORD;
    const DB_DATABASE = config.parsed?.DB_DATABASE;
    
    const connectionString: string = `mysql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}`;
    const sequelize = new Sequelize(connectionString, {
        logging: command.verbose ? console.log : false,
        dialectOptions: {
            multipleStatements: true
        }
    });

    sequelize.authenticate().catch((error) => {
        console.error(error);
        sequelize.close();
    }).then((_) => {
        console.log(`● Test database connection ${DB_HOST}:${DB_PORT} with user ${DB_USER} ${chalk.green('[✓]')}`);
        sequelize.transaction().then(async transaction => {
            try {
                
                await sequelize.query(`USE ${DB_DATABASE};`);
                console.log(`● Selected schema ${DB_DATABASE} ${chalk.green('[✓]')}`);

                console.log(`● Started doping process ${chalk.green('[✓]')}`);

                await sequelize.query(`UPDATE unidad SET tiempo=tiempo/20;`);
                console.log(`● Reduced unit construction time ${chalk.green('[✓]')}`);
                
                await sequelize.query(`UPDATE mejoraNormal SET tiempo=tiempo/20;`);
                console.log(`● Reduced investigation research time ${chalk.green('[✓]')}`);

                await sequelize.query(`UPDATE tipoMision SET tiempo=tiempo/20;`);
                await sequelize.query(`UPDATE tipoMision SET tiempo=60 WHERE id=7;`);
                console.log(`● Reduced mission time ${chalk.green('[✓]')}`);

                await sequelize.query(`UPDATE especial SET tiempoRecarga=tiempoRecarga/20, tiempoDuracion=tiempoDuracion/20;`);
                console.log(`● Reduced special power charge time ${chalk.green('[✓]')}`);

                // Guardamos
                await transaction.commit();

                console.log(`● Doping complete`);
            } catch (error) {
                console.error(error);
                // Deshacemos
                await transaction.rollback();
            }

            sequelize.close();
        });
    });
});