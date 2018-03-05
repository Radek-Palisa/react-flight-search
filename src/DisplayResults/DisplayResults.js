import React from 'react';
import './displayResults.css';

import {Card, CardHeader, CardText} from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import ActionFlightTakeoff from 'material-ui/svg-icons/action/flight-takeoff';
import ActionFlightLand from 'material-ui/svg-icons/action/flight-land';
import IconTime from 'material-ui/svg-icons/device/access-time';
import IconTransfers from 'material-ui/svg-icons/action/cached';
import IconEuro from 'material-ui/svg-icons/action/euro-symbol';
import IconLaunch from 'material-ui/svg-icons/action/launch';

export default class DisplayResults extends React.Component {
    constructor() {
        super();
        this.state = {
            currentPage: 1,
            resultsPerPage: 5
        };
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick(event) {
        this.setState({
            currentPage: Number(event.target.id)
        });
    }

    render() {
        const { currentPage, resultsPerPage } = this.state;
        const results = this.props.results;
        // Logic for displaying results
        const indexOfLastResult = currentPage * resultsPerPage;
        const indexOfFirstResult = indexOfLastResult - resultsPerPage;
        const currentResults = results.slice(indexOfFirstResult, indexOfLastResult);

        const renderResults = currentResults.map((result, index) => {
            return ( 
                <Card key={index}>
                    <CardHeader
                    className="resultCardHeader"
                    actAsExpander={true}
                    showExpandableButton={false}
                    children={<div className="resultHeader">
                        <div className="resultHeader__fromTo">
                            <ActionFlightTakeoff />
                            <span>{result.mapIdfrom}</span>
                        </div>
                        <div className="resultHeader__fromTo">    
                            <ActionFlightLand />
                            <span>{result.mapIdto}</span>
                        </div>
                        <div className="resultHeader__duration">
                            <IconTime />
                            {result.fly_duration}
                        </div>
                        <div>
                            <IconTransfers />
                            {result.route.length}
                        </div>
                        <div className="resultHeader__price">
                            <IconEuro />
                            {result.price} 
                        </div>
                    </div>}
                    />
                    <CardText 
                        expandable={true}
                        className="resultCardBody">
                        <table>
                            <thead>
                                <tr>
                                    <th>Route</th>
                                    <th>Times</th>
                                </tr>
                            </thead>
                            <tbody>
                                {result.route.map((route,index) => {
                                    return (
                                        <tr key={index}>
                                            <td>{route.mapIdfrom} → {route.mapIdto}</td>
                                            <td>{(new Date(route.dTime * 1000)).toLocaleTimeString('en-GB')} - {(new Date(route.aTime * 1000)).toLocaleTimeString('en-GB')}</td>
                                        </tr>
                                    )
                                })}

                            </tbody>
                        </table>
                        {/* <a href={result.deep_link}>Book with Kiwi <IconLaunch /></a> */}
                        <FlatButton
                            href={result.deep_link}
                            label="Book with Kiwi"
                            secondary={true}
                            icon={<IconLaunch />}
                            />
                    </CardText>
                </Card>        
            )
        });

        // Logic for displaying page numbers
        const pageNumbers = [];
        for (let i = 1; i <= Math.ceil(results.length / resultsPerPage); i++) {
            pageNumbers.push(i);
        }

        const renderPageNumbers = pageNumbers.map(number => {
            return (
                <li
                    key={number}
                    id={number}
                    className={this.state.currentPage === number ? 'active' : null}
                    onClick={this.handleClick}>
                    {number}
                </li>
            );
        });

        return (
            <div>
                <Card>
                    <CardHeader
                        className="resultCardHeader resultCardHeader--header"
                        actAsExpander={false}
                        showExpandableButton={false}
                        children={<div className="resultHeader">
                            <div className="resultHeader__fromTo">
                                <ActionFlightTakeoff />
                                <span>Origin</span>
                            </div>
                            <div className="resultHeader__fromTo">    
                                <ActionFlightLand />
                                <span>Destination</span>
                            </div>
                            <div className="resultHeader__duration">
                                <IconTime />
                                Duration
                            </div>
                            <div>
                                <IconTransfers />
                                Transfers
                            </div>
                            <div className="resultHeader__price">
                                <IconEuro />
                                Price 
                            </div>
                        </div>}
                        />
                </Card>
                {renderResults}
                <div id="page-numbers">
                    <ul>
                        {renderPageNumbers}
                    </ul>
                </div>
            </div>
        );
    }
}