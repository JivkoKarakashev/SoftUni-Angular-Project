const IdsArray = [];

function uuid(numOfIds) {
    for (let i = 0; i < numOfIds; i++) {
        const newId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            let r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return(v.toString(16));
        }); 
        IdsArray.push(newId);
    }
}

uuid(6);
console.log(IdsArray);