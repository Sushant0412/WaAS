require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks:{
    sepolia:{
      url:"https://api.zan.top/eth-sepolia",
      accounts:["0xd235dedb890e5bc456d6465fecbb4efe33472ce2442cdef55a6aa0c94b4c4bf4"]
    }
  }
};
