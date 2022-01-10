import * as React from "react";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import './App.css';
import abi from "./utils/WavePortal.json";

export default function App() {
  const [currentAccount, setCurrentAccount] = useState("");
  const [isLoadingCount, setIsLoadingCount] = useState(true);
  const [isMining, setIsMining] = useState(false);
  const [totalCount, setTotalCount] = useState(0)
  const [allWaves, setAllWaves] = useState([])
  const [message, setMessage] = useState('')

  useEffect(() => {
    checkIfWalletConnected()
    getTotalCount()
    getAllWaves()
  }, [])

  const contractAddress = '0x58e301282a908CE474A77A55ef104B8941B69A4f'
  const contractABI = abi.abi;

  const getAllWaves = async () => {
    try {
      const wavePortalContract = getContract()
      const waves = await wavePortalContract.getAllWaves()

      const wavesCleaned = waves.map(wave => ({
        address: wave.waver,
        timestamp: new Date(wave.timestamp * 1000),
        message: wave.message
      }))
      
      setAllWaves(wavesCleaned)
    } catch (error) {
      console.log(error)
    }
  }

  const getContract = () => {
    const { ethereum } = window
    
    if(!ethereum) return
    const provider = new ethers.providers.Web3Provider(ethereum)
    const signer = provider.getSigner()
    return new ethers.Contract(contractAddress, contractABI, signer)
  }

  const getTotalCount = async () => {
    setIsLoadingCount(true)
    try {
      const { ethereum } = window

      if(ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer)

        let count = await wavePortalContract.getTotalWaves()
        console.log("Retrieved total wave count: ", count.toNumber())
        setTotalCount(count.toNumber())
        setIsLoadingCount(false)
      }
    } catch(error) {
      console.log(error)
    }
  }

  const checkIfWalletConnected = async () => {
    try {
      const { ethereum } = window
    
      if(!ethereum) {
        console.log("Make sure you have metamask")
        return
      } else {
        console.log("We have the ethereum object: ", ethereum)
      }

      const accounts = await ethereum.request({ method: 'eth_accounts' })

      if(accounts.length !== 0) {
        const account = accounts[0]
        console.log('Found authorized account: ', account)
        setCurrentAccount(accounts[0])
      } else {
        console.log("No authorized account found")
      }
    } catch(error) {
      console.log(error)
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window

      if(!ethereum) {
        console.log("get metamask!")
        return
      }

      const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
      console.log('connected ', accounts[0])
      setCurrentAccount(accounts[0])
    } catch (error) {
      console.log(error)
    }
  }

  const handleMessageChange = event => setMessage(event.target.value)

  const wave = async () => {
    try {
      const { ethereum } = window

      if(ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer)

        const waveTxn = await wavePortalContract.wave(message)
        setIsMining(true)
        console.log("Mining -- ", waveTxn.hash)
        await waveTxn.wait()
        setIsMining(false)
        console.log("Mined -- ", waveTxn.hash)

        let count = await wavePortalContract.getTotalWaves()
        setTotalCount(count.toNumber())
        getAllWaves()
        setMessage('')
        console.log("Retrieved total wave count: ", count.toNumber())
      } else {
        console.log("Get metamask")
      }
    } catch (error) {
      console.log(error)
    }
  }


  
  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
        👋 Hey there!
        </div>

        <div className="bio">
          I am Spacemoses1337, have no idea about crypto and am deploying smart contracts now. Doesn't sound like a good idea? Click the button below to make me stop!
        </div>
        <input type="text" onChange={handleMessageChange} value={message} placeholder="Tell my why" />

        <button className="waveButton" disabled={message.length <= 0} onClick={wave}>
          { isMining ? '⛏ Mining...' : '🔥 Make me stop 🔥' }
        </button>

        <div>
          {isLoadingCount && (
            <p>Loading total count...</p>
          )}
          {!isLoadingCount && (
            <p>{totalCount} people tried to make me stop. It did not work.</p>
          )}
        </div>

        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}

        {allWaves.map((wave, index) => {
          return (
            <div key={index} style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px" }}>
              <div>Address: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
            </div>)
        })}
      </div>
    </div>
  );
}
