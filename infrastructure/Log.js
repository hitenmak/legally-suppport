
const LogSchema = require('../models/Log');


//----------------------------------------------


//----------------------------------------------
class Log {

    constructor({category, data, tag, note}) {
        this.category = category;
        this.tag = tag;
        this.note = note;
        this.data = data;

    }

    add = async({data, tag, note}) => {

        /*await LogSchema.create({
            category: this.category,
            tag: tag ?? this.tag,
            note: note ?? this.note,
            data: data ?? this.data,
        });*/
        // console.log(await LogSchema.find().lean());

    };


}

module.exports = Log;