import React from 'react';
import axios from 'axios';
import './searchBar.css';

import {Card, CardText} from 'material-ui/Card';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import DatePicker from 'material-ui/DatePicker';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import Paper from 'material-ui/Paper';

/* util */
function closestByClass(el, clazz) {
    while (el.className !== clazz) {
        el = el.parentNode;
        if (!el) {
            return null;
        }
    }
    return el;
}

export default class SearchBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            query: {
                flyFrom: '',
                to: '',
                dateFrom: (new Date()).toLocaleDateString(),
                dateTo: (new Date()).toLocaleDateString(),
                limit: 30,
                partner: 'picky'
            },
            datePickerTime: new Date(),
            suggestions: [],      
            suggestionInputActive: false,
            currentlyFocusedInput: null,
        }

        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleDateChange = this.handleDateChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.fetchSuggestions = this.fetchSuggestions.bind(this);
        this.handleFocus = this.handleFocus.bind(this);
        this.handleSuggestionItemClick = this.handleSuggestionItemClick.bind(this);
    }

    componentDidUpdate() {
        /* blur from the input is triggered every time the dom is updated with new suggestions,
         * so catch the event here and re-focus back to the input if it's active.
         */
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
        /* Instead of relying on blur event, listeners on click and keydown
         * are attached in order to control focusing out of the input fields
         */
        window.addEventListener('click', clickHandler)
        window.addEventListener('keydown', keypressHandler)

        var self = this;
        
        function clickHandler(event) {
            /* if clicked outside the currently active input or suggestions */
            if (!closestByClass(event.target, 'suggestions') || !closestByClass(event.target, inputName)) {
                /* if clicked into the other input, 
                 * re-run this method to update currently active input to that one,
                 * otherwise allow focus out
                 */
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

    handleSubmit(event) {
        this.props.toggleSpinnerState();
        event.preventDefault();
        axios.get('https://api.skypicker.com/flights', {
            params: {
                ...this.state.query
            }
        })
            .then(res => {
                const results = res.data.data;
                this.props.toggleSpinnerState();
                this.props.updateResults(results);
            })
            .catch(err => {
                console.log(err.message)
                this.props.toggleSpinnerState();
            })
    }

    handleInputChange(event, date) {
        const target = event.target;
        const value = target.value;
        const name = target.name;
        const query = this.state.query;
        query[name] = value;
        
        this.setState({ query });

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

    handleSuggestionItemClick(event) {
        const query = this.state.query;
        query[this.state.currentlyFocusedInput.getAttribute('name')] = event.target.innerText;
        
        this.setState({
            query,
            suggestions: []
        });
    }

    render() {
        return (
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
                                onChange={this.handleDateChange} />
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
        )
    }
}