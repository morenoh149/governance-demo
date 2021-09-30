import './App.css';
import { useState } from 'react';
import { ethers } from 'ethers'
import Greeter from './artifacts/contracts/Greeter.sol/Greeter.json'
import Token from './artifacts/contracts/Token.sol/MyToken.json'
import GovernorWOTimelock from './artifacts/contracts/GovernorWOTimelock.sol/GovernorWOTimelock.json'

// Update with the contract address logged out to the CLI when it was deployed 
const greeterAddress = "0x9A9f2CCfdE556A7E9Ff0848998Aa4a0CFD8863AE";
const governorWOTAddress = "0x3Aa5ebB10DC797CAC828524e59A333d0A371443c";
const tokenAddress = '0x68B1D87F95878fE05B998F19b66F4baba5De1aed';

function App() {
  // store greeting in local state
  const [name, setNameValue, transferCalldata, proposalDescription] = useState()

  // request access to the user's MetaMask account
  async function requestAccount() {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
  }

  // call the governor, create proposal
  async function createProposal() {
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner();
      const governor = new ethers.Contract(governorWOTAddress, GovernorWOTimelock.abi, signer)
      const token = new ethers.Contract(tokenAddress, Token.abi, signer);

      const teamAddress = '0x70997970c51812dc3a010c7d01b50e0d17dc79c8';
      const grantAmount = 10;
      const transferCalldata = token.interface.encodeFunctionData('transfer', [teamAddress, grantAmount]);

      console.log('proposal name: ', name)
      try {
        const data = await governor.propose(
          [tokenAddress],
          [0],
          [transferCalldata],
          name,
        );
        console.log('data: ', data)
        await data.wait()
      } catch (err) {
        console.log("Error: ", err)
      }
    }    
  }

  // call the smart contract, execute the proposal
  async function executeProposal() {
    if (typeof window.ethereum !== 'undefined') {
      console.log('proposal name: ', name)
      const descriptionHash = ethers.utils.id(name);

      // await requestAccount()
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner()
      const governor = new ethers.Contract(governorWOTAddress, GovernorWOTimelock.abi, signer)
      const token = new ethers.Contract(tokenAddress, Token.abi, signer);

      // const
      const teamAddress = '0x70997970c51812dc3a010c7d01b50e0d17dc79c8';
      const grantAmount = 10;
      const transferCalldata = token.interface.encodeFunctionData('transfer', [teamAddress, grantAmount]);

      const transaction = await governor.execute(
        [tokenAddress],
        [0],
        [transferCalldata],
        descriptionHash,
      );
      await transaction.wait()
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <button onClick={createProposal}>Create Proposal</button>
        <button onClick={executeProposal}>Execute Proposal</button>
        <input onChange={e => setNameValue(e.target.value)} placeholder="Set proposal description" />
      </header>
    </div>
  );
}

export default App;