import React, { useState, useEffect } from "react";
import { web3, carRentalService } from "../src/contracts/CarRentalService";
import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Nav, Navbar, Container } from 'react-bootstrap';
import sedan from '../src/assets/car.png';
import suv from '../src/assets/SUV.jpg';
import performance from '../src/assets/performance.png';

function App() {
  const toastCtrl = toast;
  const [balance, setBalance] = useState(0);
  const [price, setPrice] = useState(0);
  const [priceSedan, setPriceSedan] = useState(0);
  const [priceSuv, setPriceSuv] = useState(0);
  const [pricePerformance, setPricePerformance] = useState(0);
  const [cars, setCars] = useState(0);
  const [rentDays, setRentDays] = useState(1);
  const [rented, setRented] = useState(false);
  const [refundAmount, setRefundAmount] = useState(0);
  const [restock, setRestock] = useState(0);
  const [carChoice, setCarChoice] = useState('sedan');
// FOR SUCCESS
async function presentToast(message) {
  toast.success(message, {
    position: toast.POSITION.TOP_CENTER,
    autoClose: 3000,
    hideProgressBar: false,
    draggable: true,
    className: 'toast-success',
  });
}

// FOR DANGER
async function presentToastDanger(message) {
  toast.error(message, {
    position: toast.POSITION.TOP_CENTER,
    autoClose: 3000,
    hideProgressBar: false,
    draggable: true,
    className: 'toast-danger',
  });
}


  
  useEffect(() => {
    async function fetchData() {
      const rentalBalance = await carRentalService.methods.getRentalServiceBalance().call();
      setBalance(rentalBalance);
      const rentalPrice = await carRentalService.methods.rentalPricePerDay().call();
      setPrice(rentalPrice);
      const rentalPriceSedan = await carRentalService.methods.rentalPricePerDaySedan().call();
      setPriceSedan(rentalPriceSedan);
      const rentalPriceSUV = await carRentalService.methods.rentalPricePerDaySuv().call();
      setPriceSuv(rentalPriceSUV);
      const rentalPricePerformance = await carRentalService.methods.rentalPricePerDayPerformance().call();
      setPricePerformance(rentalPricePerformance);
      const availableCars = await carRentalService.methods.availableCars().call();
      setCars(availableCars);
      const rentedCarDays = await carRentalService.methods.rentedCars(web3.eth.defaultAccount).call();
      if (rentedCarDays > 0) {
        setRented(true);
        setRentDays(rentedCarDays);
        const refund = rentedCarDays * rentalPrice;
        setRefundAmount(refund);
      }
    }
    fetchData();
  }, []);

  const handleRent = async (event) => {
    const refundPercent = .25;
    event.preventDefault();
    let gas, gasPrice;
    if (carChoice === "sedan") {
      gas = await carRentalService.methods.rentCar_Day(carChoice, rentDays).estimateGas({ from: window.ethereum.selectedAddress, value: priceSedan * rentDays });
      gasPrice = await web3.eth.getGasPrice();
      console.log("Sedan")
      await carRentalService.methods.rentCar_Day(carChoice, rentDays).send({ from: window.ethereum.selectedAddress, value: priceSedan * rentDays, gas: gas, gasPrice: gasPrice });
      setRefundAmount(priceSedan * rentDays * refundPercent);
    } else if (carChoice === "suv") {
      gas = await carRentalService.methods.rentCar_Day(carChoice, rentDays).estimateGas({ from: window.ethereum.selectedAddress, value: priceSuv * rentDays });
      gasPrice = await web3.eth.getGasPrice();
      console.log("Suv")
      await carRentalService.methods.rentCar_Day(carChoice, rentDays).send({ from: window.ethereum.selectedAddress, value: priceSuv * rentDays, gas: gas, gasPrice: gasPrice });
      setRefundAmount(priceSuv * rentDays * refundPercent);
    } else if (carChoice === "performance") {
      gas = await carRentalService.methods.rentCar_Day(carChoice, rentDays).estimateGas({ from: window.ethereum.selectedAddress, value: pricePerformance * rentDays });
      gasPrice = await web3.eth.getGasPrice();
      console.log("Performnace")
      await carRentalService.methods.rentCar_Day(carChoice, rentDays).send({ from: window.ethereum.selectedAddress, value: pricePerformance * rentDays, gas: gas, gasPrice: gasPrice });
      setRefundAmount(pricePerformance * rentDays * refundPercent);
    }
    setRented(true);
    
  
    // Display a success toast notification
    presentToast('Car Successfully Rented!');
  };
  

  const handleReturn = async (event) => {
    event.preventDefault();
    let refund;
    const gas = await carRentalService.methods.returnCar().estimateGas({ from: window.ethereum.selectedAddress });
    const gasPrice = await web3.eth.getGasPrice();
    await carRentalService.methods.returnCar().send({ from: window.ethereum.selectedAddress, gas: gas, gasPrice: gasPrice });
    setRented(false);
    setRentDays(1);
    const refundPercent = .25;
    // Calculate the refund amount based on the car type
    if (carChoice === "sedan") {
      refund = priceSedan * rentDays * refundPercent;
    } else if (carChoice === "suv") {
      refund = priceSuv * rentDays * refundPercent;
    } else if (carChoice === "performance") {
      refund = pricePerformance * rentDays * refundPercent;
    } else {
      refund = 0;
    }
    setRefundAmount(refund);
    
    presentToast('Car Successfully Returned!');
  };
  
const handleTransfer = async (e) => {
  e.preventDefault();

  try {
    // Call the contract's transferRentalBalanceToOwner function
    await carRentalService.methods.transferRentalBalanceToOwner().send({ from: window.ethereum.selectedAddress });

    // Alert the user that the transfer was successful
    presentToast('Rental balance has been transferred to owner account!');
  } catch (err) {
    // Alert the user that the transfer failed
    presentToastDanger('Failed to transfer rental balance/ you are not the owner');
  }
};

  
  const handleAddCar = async (event) => {
    event.preventDefault();
    try {
      const gas = await carRentalService.methods.restock(restock).estimateGas({ from: window.ethereum.selectedAddress });
      const gasPrice = await web3.eth.getGasPrice();
      await carRentalService.methods.restock(restock).send({ from: window.ethereum.selectedAddress, gas: gas, gasPrice: gasPrice });
      const availableCars = await carRentalService.methods.availableCars().call();
      setCars(availableCars);
      presentToast('Car Successfully Restocked!');
    } catch (error) {
      console.log(error);
      presentToastDanger('Car failed to restocked, Only the owner can restock');
    }
  };

  return (
    
    <div className="container">
    <ToastContainer className="toast-container" />
    <header className="App-header">
     
    </header>
    <div style={{ backgroundColor: 'lightblue' }}>
      <Navbar bg="dark" variant="dark">
        <Container>
          <Navbar.Brand href="#home">Car Rental</Navbar.Brand>
          <Nav className="me-auto">
        
          </Nav>
        </Container>
      </Navbar>
      <Container>
      <h1>Car Rental Service</h1>
      <p className="lead">Rental balance: {web3.utils.fromWei(balance.toString(), 'ether')} ETH</p>
      <p className="lead">Available cars: {cars}</p>
    {rented ? (
      <div>
        <p className="lead">You are currently renting a car for {rentDays} day(s).</p>
        <p className="lead">You will receive a refund of {web3.utils.fromWei(refundAmount.toString(), 'ether')} ETH when you return the car.</p>
        <form onSubmit={handleReturn}>
          <button type="submit" className="btn btn-primary">Return Car</button>
        </form>
      </div>
    ) : (
      <div>
      <form onSubmit={handleRent}>
      <div className="form-group" style={{ display: 'flex', gap: '8rem' }}>
      <div class="card" style={{ width: '18rem' }}>
        <img src={sedan} class="card-img-top" alt="Sedan" />
        <div class="card-body">
          <h5 class="card-title">Car</h5>
          <p class="card-text">Price : 2ETH/Day</p>
          <p class="card-text">Brand : Chevrolet</p>
          <p class="card-text">Model : Spark</p>
          <p class="card-text">Color : Burning Hot Metallic</p>
        </div>
      </div>
      <div class="card" style={{ width: '18rem' }}>
        <img src={suv} class="card-img-top" alt="SUV" />
        <div class="card-body">
          <h5 class="card-title">SUV</h5>
          <p class="card-text">Price : 3ETH/Day</p>
          <p class="card-text">Brand : Chevrolet</p>
          <p class="card-text">Model : Tahoe</p>
          <p class="card-text">Color : Black</p>
        </div>
      </div>
      <div class="card" style={{ width: '18rem', }}>
        <img src={performance} class="card-img-top" alt="Pick-up Truck" />
        <div class="card-body">
          <h5 class="card-title">Performance</h5>
          <p class="card-text">Price : 4ETH/Day</p>
          <p class="card-text">Brand : Chevrolet</p>
          <p class="card-text">Model : Camaro</p>
          <p class="card-text">Color : Radiant Red Tincoat</p>
        </div>
      </div>
    </div>
        <div className="form-group" >
          <label htmlFor="carChoice">Choose a Car:</label>
          <select className="form-control" id="carChoice" value={carChoice} onChange={(e) => setCarChoice(e.target.value)} >
            <option value="sedan">Car</option>
            <option value="suv">SUV</option>
            <option value="performance">Performance</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="rentDays">Rent car for :</label>
          <input placeholder="Days" type="number" className="form-control" id="rentDays" value={rentDays} onChange={(e) => setRentDays(e.target.value)} />
        </div>
        <br></br>
        <button type="submit" className="btn btn-primary">Rent Car</button>
      </form>
    </div>
    )}
    <div className="col-md-6">
      <h2>Add new cars:</h2>
      <form onSubmit={handleAddCar}>
        <div className="form-group">
          <label htmlFor="restock">Restock Cars:</label>
          <input type="number" className="form-control" id="restock" value={restock} onChange={(e) => setRestock(e.target.value)} />
        </div>
        <br></br>
        <button type="submit" className="btn btn-primary">Add Car</button>
      </form>
      <form onSubmit={handleTransfer}>
        <div className="form-group">
          <label htmlFor="restock">Transfer Balance:</label>
        </div>
        <button type="submit" className="btn btn-primary" value={balance}onChange={(e) => setBalance(e.target.value)}>Transfer Balance</button>
      </form>
    </div>
      </Container>
    </div>
    
  </div>
    
  );
}

export default App;
