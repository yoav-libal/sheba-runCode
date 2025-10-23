const _=global
//ignoreAllByLibal
//const { sumone,getIsraelIdPerPeriod , getAllDataPerIsraelId,getFreeTestsByPolicy,removeFreeTests,insertChunkIsraelId, getMultipleIsraelId} = require('z:/dbbycode/DBlib');


// Define parameters that this script accepts

async function main(context) {
    
    
    const { sql, moment, argv, fsExtra ,ColorLog,excel,XLSX,XLSX_CALC,execSync} = context;
    global.ColorLog = ColorLog;
    global.sql=sql
    global.moment=moment
    global.fsExtra=fsExtra
    try {
        // Process command line parameters
        const params = processParameters(ColorLog,argv);
            try{
                await dbConnect(sql,connectionInfo,params,false)}catch(e)
                { ColorLog.RB('error connecting DB',e)
                    process.exit(-1);
                
            }
            ColorLog.GB('DB connected successfully');
            await sql.close();
            ColorLog.GB('DB closed successfully');

            return {

        
        };
        
    } catch (error) {
        console.error('Error in main function:', error);
        throw error;
    } finally {
console.log('finally')
    }
}



const parameters = {
    myParam: 
        
    {
        type: 'string',
        description: 'Example parameter',
        default: 'default'  // Added default value
    },
    
    num1:       {type: 'number',     default: 0,                            description: 'First number for sum'    },    
    num2:       {type: 'number',     default: 0,                            description: 'Second number for sum'    },
    user:       {type:'string',      default:'uMagicLabDBO',                   description:'DB user'},
    password:   {type:'string',      default:'SDFL#)4fms0#$kd2025',    description:'DB password'},
    server:     {type:'string',      default:'SBWND182E',              description:'DB server'},
    database:   {type:'string',      default:'labDepartment',       description:'DB database name'}
  
};

// Try to load ColorLog if it exists

function processParameters(ColorLog,argv) {
    
        ColorLog.WB('Received parameters:', argv);
    

    const processed = {};
    for (const [key, config] of Object.entries(parameters)) {
        processed[key] = argv[key] || config.default;
        
        if (processed[key] === undefined) {
            throw new Error(`Missing required parameter: ${key}`);
        }

        // Convert string numbers to actual numbers
        if (config.type === 'number' && typeof processed[key] === 'string') {
            processed[key] = Number(processed[key]);
        }
    }
    return processed;
}
var connectionInfo = { 
    user: 'sa', 
    password: 'Binavideo123', 
    server: 'binasrv', 
    database: 'bina', 
    options: { 
        useUTC: false,
        encrypt: false 
    } 
};
let sqlPool;
let sqlquery;
async function dbConnect(sql, connectionInfo,params,readonly) {
    try {
        connectionInfo.user=params.user;
        connectionInfo.password=params.password;
        connectionInfo.server=params.server;
        connectionInfo.database=params.database;
        connectionInfo.options.useUTC=true;
        connectionInfo.requestTimeout=45000,
        connectionInfo.connectionTimeout= 45000
        sqlPool = await sql.connect(connectionInfo);
        console.log('Connecting to DB with connection info:',connectionInfo);
        if (!sqlPool) throw new Error("!!!!DB Connection Error!!!");
        sqlquery = sql.query;
        return sqlPool;
    } catch (error) {
        console.error('Database connection error:', error);
        throw error;
    }
}
//Sheba
//labDepartment
