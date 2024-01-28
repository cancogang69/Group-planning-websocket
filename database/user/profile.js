import * as firebase from "../firebase.js"

export async function uploadAva(file, id){
    try {
        await firebase.uploadAva(file, id);
    } catch (e) {
        console.error(e);
    }
}

export async function downloadAva(id){
    try {
        const getImage =  await firebase.downloadAva(id);
        return getImage;
    } catch (e) {
        console.error(e);
    }
}   


