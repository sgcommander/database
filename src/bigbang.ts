import * as dotenv from 'dotenv';
import * as fs from "fs";
import figlet from 'figlet';
import chalk from 'chalk';
import { Command } from 'commander';
import { Sequelize, QueryTypes } from "sequelize";
import Prando from 'prando';

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
    const DB_USERROOT = config.parsed?.DB_USERROOT;
    const DB_PASSWORDROOT = config.parsed?.DB_PASSWORDROOT;
    const DB_CREATE = (/true/i).test(config.parsed?.DB_CREATE ?? 'false');
    const GALAXY_SECTORS = [
        parseInt(config.parsed?.GALAXY_1_SECTORS ?? '0'), 
        parseInt(config.parsed?.GALAXY_2_SECTORS ?? '0'), 
        parseInt(config.parsed?.GALAXY_3_SECTORS ?? '0'),
        parseInt(config.parsed?.GALAXY_4_SECTORS ?? '0')
    ]
    const GALAXY_SQUARES = parseInt(config.parsed?.GALAXY_SQUARES ?? '0')

    const connectionString: string = `mysql://${DB_USERROOT}:${DB_PASSWORDROOT}@${DB_HOST}:${DB_PORT}`;
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
        console.log(`● Test database connection ${DB_HOST}:${DB_PORT} with user ${DB_USERROOT} ${chalk.green('[✓]')}`);
        sequelize.transaction().then(async transaction => {
            try {
                if (DB_CREATE) {
                    await sequelize.query(`DROP SCHEMA IF EXISTS ${DB_DATABASE};`);
                    await sequelize.query(`CREATE SCHEMA IF NOT EXISTS ${DB_DATABASE} DEFAULT CHARACTER SET utf8 COLLATE utf8_spanish2_ci;`);
                    console.log(`● Created schema ${DB_DATABASE} ${chalk.green('[✓]')}`);
                }
                
                await sequelize.query(`USE ${DB_DATABASE};`);
                console.log(`● Selected schema ${DB_DATABASE} ${chalk.green('[✓]')}`);

                console.log(`● Started schema building ${chalk.green('[✓]')}`);

                var sqlQuery = fs.readFileSync(`${__dirname}/../schema/1.-limpiar.sql`, 'utf8');
                await sequelize.query(sqlQuery);
                console.log(`    ● (1/6) Settings ${chalk.green('[✓]')}`);

                sqlQuery = fs.readFileSync(`${__dirname}/../schema/2.-crear.sql`, 'utf8');
                await sequelize.query(sqlQuery);
                console.log(`    ● (2/6) Created tables ${chalk.green('[✓]')}`);

                var paths = [
                    {
                        message: `    ● (3/6) Created procedures ${chalk.green('[✓]')}`,
                        folder: '3.-Procedimientos',
                        files: ['cantidadProporcional', 'decPuntosUnidad', 'eliminarUnidadMision', 'incPuntosUnidad']
                    },
                    {
                        message: `    ● (4/6) Created triggers ${chalk.green('[✓]')}`,
                        folder: '4.-Triggers',
                        files: ['alianza', 'especiales', 'mejoras', 'mensajeria', 'misiones', 'planetas', 'recursos', 'unidad', 'usuario']
                    },
                    {
                        message: `    ● (5/6) Inserted data ${chalk.green('[✓]')}`,
                        folder: '5.-Insertar',
                        files: ['0.-constantes', '1.-razas', '2.-unidades', '3.-mejoras', '4.-misiones', '5.-especiales', '6.-planetas', '7.-mensajes', '8.-idiomas']
                    }
                ];

                for (const path of paths) {
                    for (const file of path.files) {
                        let sqlQuery = fs.readFileSync(`${__dirname}/../schema/${path.folder}/${file}.sql`, 'utf8');
                        await sequelize.query(sqlQuery);
                    }

                    console.log(path.message);
                }

                sqlQuery = fs.readFileSync(`${__dirname}/../schema/6.-finCrear.sql`, 'utf8');
                await sequelize.query(sqlQuery);
                console.log(`    ● (6/6) Restored default setting ${chalk.green('[✓]')}`);

                const startTime = new Date().getTime();

                const galaxyLetters = ['V','P','A'];
                const sectorLetters = 'ABCDEFGHIJKL0123456789MNOPQRSTUVWXYZ';
                //const richness = [10,10,10,20,20,20,30,30,30,40,40,40,60,60,60,60,60,70,70,70,70,80,80,90,100]; //Descomentar para empobrecer la galaxia
                const richness = [10,20,30,40,40,60,60,60,70,70,80,80,90,100];

                console.log(`● Universe creation started ${chalk.green('[✓]')}`);
                await sequelize.query(`SET FOREIGN_KEY_CHECKS = 0;`);
                await sequelize.query(`TRUNCATE planetaExplorado;`);
                await sequelize.query(`TRUNCATE planetaColonizado;`);
                await sequelize.query(`TRUNCATE planetaEspecial;`);
                await sequelize.query(`TRUNCATE planeta;`);
                await sequelize.query(`SET FOREIGN_KEY_CHECKS = 1;`);
                await sequelize.query(`SET max_heap_table_size=1048576000;`);
                await sequelize.query(`ALTER TABLE tPlanetaMem ENGINE MEMORY;`);

                const rng = new Prando();
                const GALAXIES = 3;
                const PLANETS = 16;

                for (let galaxy = 0; galaxy < GALAXIES; galaxy++) {
                    var idPlanet = 1;
                    for (let sector = 0; sector < GALAXY_SECTORS[galaxy]; sector++) {
                        for (let square = 0; square < GALAXY_SQUARES; square++) {
                            for (let planet = 0; planet < PLANETS; planet++) {
                                let rich = richness[rng.nextInt(0, richness.length-1)];
                                let nameSGC = `${galaxyLetters[galaxy]}${square+1}${sectorLetters.substr(sector,1)}-${(square+1).toString().padStart(2, '0')}${(planet+1).toString().padStart(2, '0')}`;
                                var coordinates = [];
                                for (let index = 0; index < 7; index++) {
                                    const coordinate = rng.nextInt(GALAXIES,sectorLetters.length+GALAXIES);
                                    coordinates.push(coordinate);
                                }
                                await sequelize.query(`INSERT INTO tPlanetaMem VALUES (${idPlanet},${galaxy+1},'','${nameSGC}',${coordinates[0]},${coordinates[1]},${coordinates[2]},${coordinates[3]},${coordinates[4]},${coordinates[5]},${coordinates[6]},${rich});`);
                                idPlanet++;
                            }
                        }
                    }

                    await sequelize.query(`INSERT INTO planeta SELECT * FROM tPlanetaMem;`);
                    await sequelize.query(`DELETE FROM tPlanetaMem;`);
                    
                    // Procesamos los planetas especiales de la galaxia
                    const specialPlanets = await sequelize.query(`SELECT idPlaneta AS planetId, idGalaxia AS galaxyId, nombrePlaneta AS name, imagen AS image, riqueza AS richness
                                                            FROM tPlaneta 
                                                            WHERE idGalaxia=${galaxy+1}
                                                            ORDER BY RAND()`, { type: QueryTypes.SELECT });

                    console.log(`    ● ${specialPlanets.length} special planets in galaxy ${galaxy+1}`);                                       

                    // Generamos posiciones aleatorias para los planetas especiales
                    var positions: number[] = [];
                    while(positions.length < specialPlanets.length) {
                        const position = rng.nextInt(1, GALAXY_SECTORS[galaxy] * GALAXY_SQUARES * PLANETS);
                        if(!positions.includes(position)) {
                            positions.push(position);
                        }
                    }

                    for (let index = 0; index < specialPlanets.length; index++) {
                        const planet: any = specialPlanets[index];
                        
                        await sequelize.query(`INSERT INTO planetaEspecial (idPlanetaEsp, idGalaxia, imagen) VALUES (${positions[index]},${galaxy+1},'${planet.image}');`);
                        await sequelize.query(`UPDATE planeta SET nombrePlaneta='${addslashes(planet.name)}', riqueza=${planet.richness} WHERE idGalaxia=${galaxy+1} AND idPlaneta=${positions[index]};`);
                    
                        const specialUnits: any[] = await sequelize.query(`SELECT idUnidad AS unitId FROM tPlanetaUnidad WHERE idGalaxia=${galaxy+1} AND idPlanetaEsp=${planet.planetId};`, { type: QueryTypes.SELECT });
                        for (let index2 = 0; index2 < specialUnits.length; index2++) {
                            const unit: any = specialUnits[index2];
                            await sequelize.query(`INSERT INTO planetaUnidad (idUnidad, idPlanetaEsp, idGalaxia) VALUES (${unit.unitId},${positions[index]},${galaxy+1});`);
                        }

                        const specialPowers: any[] = await sequelize.query(`SELECT idEspecial AS powerId FROM tEspecialRequierePlaneta WHERE idGalaxia=${galaxy+1} AND idPlanetaEsp=${planet.planetId};`, { type: QueryTypes.SELECT });
                        for (let index2 = 0; index2 < specialPowers.length; index2++) {
                            const power: any = specialPowers[index2];
                            await sequelize.query(`INSERT INTO especialRequierePlaneta (idEspecial, idGalaxia, idPlanetaEsp) VALUES (${power.powerId},${galaxy+1},${positions[index]});`);
                        }
                    }

                    console.log(`    ● (${galaxy+1}/${GALAXIES+1}) Galaxy ${galaxy+1} created ${chalk.green('[✓]')}`);
                }

                // Midway
                var coordinates = [];
                for (let index = 0; index < 7; index++) {
                    const coordinate = rng.nextInt(GALAXIES+2,sectorLetters.length+GALAXIES);
                    coordinates.push(coordinate);
                }
                await sequelize.query(`INSERT INTO planeta VALUES (1,${GALAXIES+1},'Midway','M1A-11',${coordinates[0]},${coordinates[1]},${coordinates[2]},${coordinates[3]},${coordinates[4]},${coordinates[5]},${GALAXIES+1},0);`);
                await sequelize.query(`INSERT INTO planetaEspecial (idPlanetaEsp, idGalaxia, imagen) VALUES (1,${GALAXIES+1},'midway.jpg');`);
                await sequelize.query(`INSERT INTO especialRequierePlaneta (idEspecial, idGalaxia, idPlanetaEsp) VALUES (556,${GALAXIES+1},1);`);
                console.log(`    ● (${GALAXIES+1}/${GALAXIES+1}) Midway created ${chalk.green('[✓]')}`);

                // Limpiamos restos
                await sequelize.query(`DROP TABLE tPlaneta;`);
                await sequelize.query(`DROP TABLE tPlanetaUnidad;`);
                await sequelize.query(`DROP TABLE tEspecialRequierePlaneta;`);
                await sequelize.query(`DROP TABLE tPlanetaMem;`);

                // Guardamos
                await transaction.commit();

                const endTime = new Date().getTime();

                console.log(`● God created universe in ${chalk.green(((endTime - startTime) / 1000).toString())} seconds`);
            } catch (error) {
                console.error(error);
                // Deshacemos
                await transaction.rollback();
            }

            sequelize.close();
        });
    });
});

function addslashes(string: string) {
    return string.replace(/\\/g, '\\\\').
        replace(/\u0008/g, '\\b').
        replace(/\t/g, '\\t').
        replace(/\n/g, '\\n').
        replace(/\f/g, '\\f').
        replace(/\r/g, '\\r').
        replace(/'/g, '\\\'').
        replace(/"/g, '\\"');
}
