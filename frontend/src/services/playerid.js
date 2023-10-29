import { v4 as uuidv4 } from 'uuid';

let gycID = localStorage.getItem('gycID');
if(gycID == null){
  try {
    const potentialID = uuidv4()
    localStorage.setItem('gycID', potentialID);
    gycID = potentialID;
  }
  catch(err){
    console.err('Could not generate player ID');
  }
}

export default gycID;