import React, { useState, useEffect } from "react";
import { web3, carRentalService } from "../src/contracts/CarRentalService";
import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Nav, Navbar, Container } from 'react-bootstrap';

function App() {
  const toastCtrl = toast;
  const [balance, setBalance] = useState(0);
  const [price, setPrice] = useState(0);
  const [cars, setCars] = useState(0);
  const [rentDays, setRentDays] = useState(1);
  const [rented, setRented] = useState(false);
  const [refundAmount, setRefundAmount] = useState(0);
  const [restock, setRestock] = useState(0);

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
    event.preventDefault();
    const gas = await carRentalService.methods.rentCar_Day(rentDays).estimateGas({ from: window.ethereum.selectedAddress, value: price * rentDays });
    const gasPrice = await web3.eth.getGasPrice();
    await carRentalService.methods.rentCar_Day(rentDays).send({ from: window.ethereum.selectedAddress, value: price * rentDays, gas: gas, gasPrice: gasPrice });
    setRented(true);
    setRefundAmount(price * rentDays);
  
    // Display a success toast notification
    presentToast('Car Successfully Rented!');
  };
  
  
  const handleReturn = async (event) => {
    event.preventDefault();
    const gas = await carRentalService.methods.returnCar().estimateGas({ from: window.ethereum.selectedAddress });
    const gasPrice = await web3.eth.getGasPrice();
    await carRentalService.methods.returnCar().send({ from: window.ethereum.selectedAddress, gas: gas, gasPrice: gasPrice });
    setRented(false);
    setRentDays(1);
    setRefundAmount(0);

    presentToast('Car Successfully Return!');
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
            <Nav.Link href="#home">Home</Nav.Link>
            <Nav.Link href="#features">Features</Nav.Link>
            <Nav.Link href="#pricing">Pricing</Nav.Link>
          </Nav>
        </Container>
      </Navbar>
      <Container>
        <h1>Car Rental Service</h1>
        <p>Start building your app here.</p>
        <p className="lead">Rental balance: {web3.utils.fromWei(balance.toString(), 'ether')} ETH</p>
    <p className="lead">Rental price per day: {web3.utils.fromWei(price.toString(), 'ether')} ETH</p>
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
          <div className="form-group">
            <label htmlFor="rentDays">Rent car for:</label>
            <input type="number" className="form-control" id="rentDays" value={rentDays} onChange={(e) => setRentDays(e.target.value)} />
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
    </div>
      </Container>
    </div>
    
  </div>
    
  );
}

export default App;
