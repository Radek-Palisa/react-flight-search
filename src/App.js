import React, { Component } from 'react';
import axios from 'axios';

import AppHeader from './AppHeader/AppHeader';
import AppFooter from './AppFooter/AppFooter';
import DisplayResults from './DisplayResults/DisplayResults';

// eslint-disable-next-line 
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
// eslint-disable-next-line 
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar';
// eslint-disable-next-line 
import {List, ListItem} from 'material-ui/List';
import CircularProgress from 'material-ui/CircularProgress';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import DatePicker from 'material-ui/DatePicker';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import Paper from 'material-ui/Paper';

function closestByClass(el, clazz) {
    while (el.className !== clazz) {
        el = el.parentNode;
        if (!el) {
            return null;
        }
    }
    return el;
}

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            query: {
                flyFrom: 'prague',
                to: 'london',
                dateFrom: (new Date()).toLocaleDateString(),
                dateTo: (new Date()).toLocaleDateString(),
                limit: 30
            },
            datePickerTime: new Date(),
            results: null,
            suggestions: [],      
            suggestionInputActive: false,
            currentlyFocusedInput: null,
            spinnerOn: false,
        };
    
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleDateChange = this.handleDateChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.fetchSuggestions = this.fetchSuggestions.bind(this);
        this.handleFocus = this.handleFocus.bind(this);
        this.handleSuggestionItemClick = this.handleSuggestionItemClick.bind(this);
    }

    componentDidUpdate() {
        if (this.state.currentlyFocusedInput) {
            if (this.state.suggestionInputActive) {
                this.state.currentlyFocusedInput.focus();
            } else {
                this.state.currentlyFocusedInput.blur();
                this.setState({ currentlyFocusedInput: null})
            }
        }
    }

    handleFocus(event) {
        const inputName = event.target.getAttribute('name');

        this.setState({
            suggestionInputActive: true,
            currentlyFocusedInput: event.target
        })
        window.addEventListener('click', clickHandler)
        window.addEventListener('keydown', keypressHandler)

        var self = this;
        
        function clickHandler(event) {
            if (closestByClass(event.target, 'suggestions') || closestByClass(event.target, inputName)) {
            } else {

                if (event.target.getAttribute('name') === 'to' || event.target.getAttribute('name') === 'flyFrom') {
                    self.handleFocus(event);
                    self.setState({ suggestions: [] });
                } else {
                    self.setState({  
                        suggestionInputActive: false,
                        suggestions: []
                    })
                }
           
                window.removeEventListener('keydown', keypressHandler)
                window.removeEventListener('click', clickHandler);
            }
        }
        function keypressHandler(event) {
            if ((event.shiftKey && event.key === 'Tab') || event.key === 'Tab') {

                self.setState({ 
                    suggestionInputActive: false,
                    suggestions: []
                })
                window.removeEventListener('keydown', keypressHandler)
                window.removeEventListener('click', clickHandler);
            }
        }
    }
 
    fetchSuggestions(value) {
        axios.get(`https://api.skypicker.com/locations/`, {
            params: {
                term: value,
                locale: 'en-US',
                limit: 7
            }
        })
            .then(res => {            
                const suggestions = res.data.locations.map(location => location.name);
                this.setState({ suggestions });
            })
    }

    handleInputChange(event, date) {

        const target = event ? event.target : date;
        const value = target.value;
        const name = target.name;
        const query = this.state.query;
        query[name] = value;
        
        this.setState({
            query,
        });

        this.fetchSuggestions(target.value);
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
                ...this.state.query
            }
        })
            .then(res => {
                const results = res.data.data;
                this.setState({spinnerOn: false});
                this.setState({ results });
            })
            .catch(err => {
                console.log(err.message)
                this.setState({
                    spinnerOn: false,
                });
            })
    }

    handleSuggestionItemClick(event) {
        const query = this.state.query;
        query[this.state.currentlyFocusedInput.getAttribute('name')] = event.target.innerText;
        
        this.setState({
            query,
            suggestions: []
        });
    }

    render() {

        const determineResultsField = (results) => {
            if (results === null) {
                return (<p className="searchPrompt">Use the search bar to search for flights</p>)
            } else if (results.length === 0) {
                return (<p className="searchPrompt">ups, looks like there are no flights for the given criteria</p>)
            } else {
                return (<DisplayResults results={this.state.results} />)
            }
        }

        return (
            <div className="App">
                <AppHeader />
                <div>
                    <div>
                        <Card>
                            <CardText>
                                <form
                                    className="searchForm" 
                                    onSubmit={this.handleSubmit}>
                                    <div>
                                    <TextField
                                        className="flyFrom"
                                        name="flyFrom"
                                        autoComplete="off"
                                        floatingLabelText="Fly from"
                                        value={this.state.query.flyFrom}
                                        onFocus={this.state.suggestionInputActive ? null : this.handleFocus}
                                        onChange={this.handleInputChange}
                                        />
                                    <TextField
                                        className="to"
                                        name="to"
                                        autoComplete="off"
                                        floatingLabelText="Fly to"
                                        value={this.state.query.to}
                                        onFocus={this.state.suggestionInputActive ? null : this.handleFocus}
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
                                    {this.state.suggestions.length > 0 ? 
                                        <Paper 
                                            className="suggestions"
                                            style={{
                                                    left: (() => {
                                                        if (this.state.currentlyFocusedInput.getAttribute('name') === 'to') {
                                                            return '277px'
                                                        }
                                                    })()
                                            }}>
                                            <Menu desktop={true}>
                                                {this.state.suggestions.map((suggestion, index) => {
                                                    return (
                                                        <MenuItem
                                                            primaryText={suggestion}
                                                            key={index}
                                                            onClick={this.handleSuggestionItemClick} />
                                                    )
                                                })}
                                            </Menu>
                                        </Paper> : null
                                    }
                                    </div>
                                </form>
                            </CardText>
                        </Card>

                    </div>
                    <div
                        className="searchResults">
                        <div>
                            {determineResultsField(this.state.results)}
                        </div>
                        
                        { this.state.spinnerOn ? 
                            <div className="spinner">
                                <CircularProgress size={60} thickness={6} />
                            </div> : null
                        }
                    </div>                    
                </div>
                <AppFooter />
            </div>    
        );
    }
}

export default App;
