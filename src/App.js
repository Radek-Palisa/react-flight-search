import React from 'react';
import CircularProgress from 'material-ui/CircularProgress';

import AppHeader from './AppHeader/AppHeader';
import AppFooter from './AppFooter/AppFooter';
import DisplayResults from './DisplayResults/DisplayResults';
import SearchBar from './SearchBar/SearchBar';

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            results: null,
            spinnerOn: false,
        };

        this.updateResults = this.updateResults.bind(this);
    }

    updateResults(results) {
        this.setState({ results })
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
                       <SearchBar updateResults={this.updateResults} />
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
