import React, { Component } from 'react';
import axios from 'axios';
import logo from './logo.svg';
import './App.css';
// eslint-disable-next-line 
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
// eslint-disable-next-line 
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar';
// eslint-disable-next-line 
import {List, ListItem} from 'material-ui/List';
import ActionFlightTakeoff from 'material-ui/svg-icons/action/flight-takeoff';
import ActionFlightLand from 'material-ui/svg-icons/action/flight-land';
import IconTime from 'material-ui/svg-icons/device/access-time';
import IconEuro from 'material-ui/svg-icons/action/euro-symbol';
import CircularProgress from 'material-ui/CircularProgress';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import DatePicker from 'material-ui/DatePicker';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import Paper from 'material-ui/Paper';

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            query: {
                flyFrom: '',
                to: '',
                dateFrom: '',
                dateTo: '',
                partner: 'picky'
            },
            datePickerTime: new Date(),
            results: [],
            suggestions: [],      
            suggestionInputActive: false,
            suggestionsPopover: false,
            spinnerOn: false,
        };

        //this.suggestionInputActive = false;
    
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleDateChange = this.handleDateChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.makeSuggestions = this.makeSuggestions.bind(this);
        this.handleSuggestionsPopoverClose = this.handleSuggestionsPopoverClose.bind(this);
        this.focusBack = this.focusBack.bind(this);
    }

    componentDidMount() {

    }
    componentDidUpdate() {
        //console.log('componentDidUpdate')
        //this.textInput.focus();
    }

    focusBack() {
        this.textInput.focus();
    }
 
    makeSuggestions(event, target) {
        axios.get(`https://api.skypicker.com/locations/`, {
            params: {
                term: target.value,
                locale: 'en-US',
                limit: 7
            }
        })
            .then(res => {
                //this.setState({ suggestionInputActive: true });
                //this.suggestionInputActive = true;
                
                const suggestions = res.data.locations.map(location => location.name);
                this.setState({ suggestions });
                this.setState({ suggestionsPopover: true })
                console.log('makeSuggestions ', event)
                this.focusBack();
                
                // if (suggestions.length !== 0) {
                //     if (!this.state.suggestionsPopover) {
                //         console.log(this.state.suggestionsPopover)
                //         this.setState({ suggestionsPopover: true });
                //     }
                    
                // } else {
                //     this.setState({ suggestionsPopover: false });
                // }
                // //console.log(this.suggestionInputActive)
                // //this.setState({ suggestionInputActive: false });
                // //console.log('from makeSuggestions ', this.state.suggestionInputActive)
                // //this.suggestionInputActive = false;

                // console.log('makeSuggestions ', document.activeElement)       
                // console.log('makeSuggestions ', event)       
                //target.focus();
            })
    }

    handleInputChange(event, date) {
        event.preventDefault;
        const target = event ? event.target : date;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;
        const query = this.state.query;
        query[name] = value;
        
        this.setState({
            query,
        });
        console.log(event.type)
        if (event.type === 'change') {
            //console.log('change', event.type)
            this.makeSuggestions(event.type, target);
        }
        // //this.setState({ suggestionInputActive: true });
        // //console.log('from handleInputChange ', this.state.suggestionInputActive);
        // //this.setState({ suggestionInputActive: false });
        // console.log('from handleInputChange 2', this.state.suggestionInputActive);

    }

    handleDateChange(event, date) {
        const query = this.state.query;
        query.dateFrom = date.toLocaleDateString()
        query.dateTo = date.toLocaleDateString()
        this.setState({
            query
        })
        this.setState({ datePickerTime: date})
    }

    handleSubmit(event) {
        this.setState({spinnerOn: true});
        event.preventDefault();
        axios.get(`https://api.skypicker.com/flights`, {
            params: {
                flyFrom: this.state.query.flyFrom,
                to: this.state.query.to,
                dateFrom: this.state.query.dateFrom,
                dateTo: this.state.query.dateTo,
                partner: this.state.query.partner,
                limit: 6
            }
        })
            .then(res => {
                const results = res.data.data;
                this.setState({spinnerOn: false});
                this.setState({ results });
            })
    }

    handleSuggestionsPopoverClose(event) {
        console.log('handleSuggestionsPopoverClose', document.activeElement)
        // this.setState({
        //     suggestionsPopover: false,
        // });
        console.log('handleSuggestionsPopoverClose',event.type)
    }

    render() {

        return (
            <div className="App">
                <header className="App-header">
                    <img src={logo} className="App-logo" alt="logo" />
                    <h1 className="App-title">Flight search built on React and Kiwi API</h1>
                </header>
                <div>
                    <Card>
                        <CardText>
                            <form
                                className="searchForm" 
                                onSubmit={this.handleSubmit}>
                                <TextField
                                    className={this.state.suggestionsPopover ? 'active' : 'inactive'}
                                    name="flyFrom"
                                    hintText="Hint Text"
                                    floatingLabelText="Fly from"
                                    value={this.state.query.flyFrom}
                                    onChange={this.handleInputChange}
                                    onBlur={this.handleInputChange}
                                    ref={(input) => { this.textInput = input; }}
                                    />
                                <TextField
                                    name="to"
                                    hintText="Hint Text"
                                    floatingLabelText="Fly to"
                                    value={this.state.query.to}
                                    onChange={this.handleInputChange}
                                    />
                                <DatePicker
                                    value={this.state.datePickerTime}
                                    className="datePicker"
                                    DateTimeFormat={global.Intl.DateTimeFormat}
                                    locale="en-GB"
                                    hintText="Portrait Dialog"
                                    autoOk={true}

                                    onChange={this.handleDateChange}/>
                                <RaisedButton
                                    className="submitButton"
                                    label="Search"
                                    primary={true}
                                    type="submit"
                                    />
                            </form>
                        </CardText>
                    </Card>
                    {this.state.suggestionsPopover ? 
                        <Paper className="suggestions">
                            <Menu desktop={true}>
                                {this.state.suggestions.map((suggestion, index) => {
                                    console.log('hello')
                                    return (
                                        <MenuItem primaryText={suggestion} key={index} />
                                    )
                                })}
                                {console.log('from render', document.activeElement)}
                            </Menu>
                        </Paper> : null
                    }
                </div>
                <br />
                <div
                    className="searchResults">
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
                                <div>
                                    <IconTime />
                                    Duration
                                </div>
                                <div className="resultHeader__price">
                                    <IconEuro />
                                    Price 
                                </div>
                            </div>}
                            />
                    </Card>
                    {this.state.results.map(result => {
                        return (
                            <Card>
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
                                    <div>
                                        <IconTime />
                                        {result.fly_duration}
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
                                            {result.route.map(route => {
                                                return (
                                                    <tr>
                                                        <td>{route.mapIdfrom} → {route.mapIdto}</td>
                                                        <td>{(new Date(route.dTime * 1000)).toLocaleTimeString('en-GB')} - {(new Date(route.aTime * 1000)).toLocaleTimeString('en-GB')}</td>
                                                    </tr>
                                                )
                                            })}

                                        </tbody>
                                    </table>
                                </CardText>
                            </Card>
                        )
                    })}
                </div>
                { this.state.spinnerOn ? <div className="spinner">
                    <CircularProgress size={60} thickness={6} />
                </div> : null       
                }
            </div>
        );
    }
}

export default App;
