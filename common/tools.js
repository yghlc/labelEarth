// basic functions

// Lingcao Huang (huanglingcao@gmail.com)
// 22 April 2022

// Using ECMAScript6 (ES6), you can use the import/export feature.

// export {getNowstr} function here, then
// import {getNowstr} from "../common/tools", but import can only be used in modules, like:
// <script type="module" src="./infoFormEdit.js"></script>

function getNowstr(){
    let timeElapsed = Date.now();
    let now = new Date(timeElapsed);
    return now;
}
export {getNowstr}