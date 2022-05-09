import { useState } from "react";
const LiquidityList = () => {
    const [collapse, setCollapse] = useState(false);
    const [removeStatus, setRemovestatus] = useState(false);
    const changeCollpase = () => {
        if (collapse === true)
            setCollapse(false);
        else setCollapse(true);
    }
    const removeOnClick = () => {
        if (removeStatus === false)
            setRemovestatus(true);
        else setRemovestatus(false);
    }
    return (
        <>
            <div className="LiquidityList">
                {!removeStatus ? <div className="single-liquidity">
                    <a onClick={changeCollpase} style={{ cursor: "pointer" }}>
                        <div className="single-liquidity-header">
                            <div className="single-liquidity-header-left">
                                <img style={{ width: "32px", height: "32px" }} src="./images/eth.png" />
                                <img style={{ width: "32px", height: "32px", marginLeft: "8px" }} src="./images/aave.png" />
                                <p >ETH/AAVE</p>
                            </div>
                            <div className="single-liquidity-header-right">
                                <img src="./images/up.png" style={{ width: "20px", height: "20px", display: collapse ? "none" : "block" }} />
                                <img src="./images/down.png" style={{ width: "20px", height: "20px", display: collapse ? "block" : "none" }} />
                            </div>
                        </div>
                    </a>
                    <div className="single-liquidity-content" style={{ height: collapse ? "0px" : "296px" }}>
                        <div style={{ display: collapse ? "none" : "flex", justifyContent: "space-between" }}>
                            <p className="single-token-left">Your total pool tokens</p>
                            <p className="single-token-right">0.00092110891</p>
                        </div>
                        <div style={{ display: collapse ? "none" : "flex", justifyContent: "space-between" }}>
                            <p className="single-token-left">Pooled Eth</p>
                            <p className="single-token-right">0.000226482 ETH</p>
                        </div>
                        <div style={{ display: collapse ? "none" : "flex", justifyContent: "space-between" }}>
                            <p className="single-token-left">Pooled AWC</p>
                            <p className="single-token-right">0.00069512692 AWC</p>
                        </div>
                        <div style={{ display: collapse ? "none" : "flex", justifyContent: "space-between" }}>
                            <p className="single-token-left">Your pool share</p>
                            <p className="single-token-right">0.14%</p>
                        </div>
                        <div className="description" style={{ display: collapse ? "none" : "flex", transition: "1s" }}>
                            <p>View Accure Fees and Analytics</p>
                        </div>
                        <div style={{ display: collapse ? "none" : "flex", justifyContent: "center", transition: "1s" }}>
                            <button onClick={removeOnClick}><p>Remove</p></button>
                        </div>
                    </div>
                </div> :
                    <div className="remove-liquidity-warrap">
                        <div className="remove-liquidity">
                            {/* <div className="remove-header-top" style={{ display: "flex", justifyContent: "center" }}>
                            <p>Remove Liquidity</p>
                        </div> */}
                            <div className="remove-header">
                                <p >
                                    Confirm to close your position
                                </p>
                            </div>
                            <div className="remove-content">
                                <div className="content-header">
                                    <p>You will receive</p>
                                </div>
                                <div className="description2">
                                    <div className="eth">
                                        <div className="eth-left">
                                            <p>0.000226482</p>
                                        </div>
                                        <div className="eth-right">
                                            <img style={{ width: "32px", height: "32px" }} src="./images/eth.png" />
                                            <p>ETH</p>
                                        </div>
                                    </div>
                                    <div className="eth">
                                        <div className="eth-left">
                                            <p>0.00069562691</p>
                                        </div>
                                        <div className="eth-right">
                                            <img style={{ width: "32px", height: "32px", marginLeft: "8px" }} src="./images/aave.png" />
                                            <p>AAVE</p>
                                        </div>
                                    </div>
                                    <div className="change-description">
                                        <p>Output is estimated. If the price changes by more than 0.5% your transaction will revert.</p>
                                    </div>
                                    <div className="earned-table-header">
                                        <p>ETH/AWC</p>
                                    </div>
                                    <div className="earned-table">
                                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                                            <div><p style={{ color: "#A6A0BB" }}>ETH/AAVE</p></div>
                                            <div style={{ display: "flex", alignItems: "center" }}>
                                                <p style={{ color: "white" }}>0.325646436</p>
                                                <img style={{ width: "32px", height: "32px", marginLeft: "8px" }} src="./images/eth.png" />
                                                <img style={{ width: "32px", height: "32px", marginLeft: "8px" }} src="./images/aave.png" />
                                            </div>
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                                            <div><p style={{ color: "#A6A0BB" }}>ETH/AAVE</p></div>
                                            <div style={{ display: "flex", flexDirection: "column" }}>
                                                <div style={{ display: "flex", justifyContent: "end" }}>
                                                    <p style={{ color: "white" }}>1ETH=1084.40 AVVE</p>
                                                </div>
                                                <p style={{ color: "white" }}>1AVVE=0.000922 AVVE</p>
                                            </div>
                                        </div>
                                        <div style={{ width: "380", height: "71px", display: "flex", justifyContent: "center" }}>
                                            <p style={{ color: "white", fontSize: "20px", fontWeight: "700" }}>You earned 15% APY with Double</p>
                                        </div>

                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px" }}>
                                        <div className="cancel-button-warrap">
                                            <button className="cancel-button" style={{ width: "199px", height: "46px", border: "0px" }} onClick={removeOnClick}><p>cancel</p></button>
                                        </div>
                                        <button className="confirm" style={{ width: "201px", height: "48px", border: "0px" }} onClick={removeOnClick}><p>confirm</p></button>
                                    </div>
                                </div>
                            </div>
                        </div></div>}
            </div>
        </>
    )
}
export default LiquidityList;