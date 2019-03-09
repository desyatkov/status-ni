import React, { Component } from 'react';
import moment from 'moment';
import axios from 'axios';
import shortid from 'shortid';
var _ = require('lodash');


const Tooltip = (data) => {
    const source = data.data;
    if (source.length === 0) return <div className='empty'></div>

    const status = _.every(source.status, ['status', "resolved"]);
    let classNames = ['incedent']
    if (!status) classNames.push('active')

    return (
        <div className='incedent_elem_main'>
            <div className={classNames.join(" ")}></div>
            <div className="incedent_elem_wrap">
                <ul className="incedent_elem_list" >
                    {source.map(incedent=>{
                        return (
                            <li key={shortid.generate()}>
                                <div>{incedent.name}</div>
                                <div>Created: {moment(incedent.created_at).format('DD/MMMM')}</div>
                                <div className={incedent.impact}>Impact: {incedent.impact}</div>
                                <div className={incedent.status + " status"}>Status: {incedent.status}</div>
                                <div>
                                    <a href={incedent.shortlink}>Incedent Link</a>
                                </div>
                            </li>
                        )
                    })}
                </ul>
            </div>
        </div>
    )
}

class TableElement extends Component {

    constructor(props) {
        super(props);

        this.state = {
            rows: [],
            rowHeaders: {},
            incidents: {}
        }
    }

    componentDidMount() {
        let objectDates = []
        for(let i=0; i<=5; i++){
            let startdate = moment().subtract(i, "days");        
            objectDates.push({
                id: shortid.generate(),
                date: startdate,
                dateFormated: startdate.format('DD/MM')
            })
        }
        objectDates.reverse()

        this.setState({
            headers: objectDates
        });


        axios.get('/index.json')
            .then(function (response) {
                const {components, incidents} = response.data;


                const filerTo = id => {   
                    return objectDates.map((date) => {
                        return _.filter(incidents, function(incedent) { 
                            const incedentDate = moment(incedent.created_at)
                            const arrayDate = date.date

                            const groupid = _.some(incedent.components, { 'group_id': id });

                            return arrayDate.isSame(incedentDate, 'date') && groupid
                         });       
                    })
                };
            
                const rows = [];

                components.forEach( ({name, id, position}) =>{
                    rows.push({
                        rowName: name,
                        rowId: id,
                        rowPosition: position,
                        incedents: filerTo(id)
                    })
                })

                this.setState({
                    rowHeaders: response.data.components,
                    incidents: response.data.incidents,
                    rows: rows
                })
            }.bind(this))
            .catch(function (error) {
                
            })
    }

    
    
    render() {
        const { rowHeaders, rows } = this.state;

        if (!rowHeaders.length) {
            return <p>Loading...</p>;
        }
        
        return (
            <table>
                <thead>
                    <tr>
                        <td className='service_name'>Service</td>
                        {this.state.headers.map((item)=>{
                            return (
                                <td className='service_status' id={item.id} key={item.id}>
                                    {item.dateFormated}
                                </td>
                            )
                        })}
                    </tr>
                </thead>
                <tbody>
                    {rows.map( (row) => {
                        return (
                            <tr key={row.rowId}>
                                <td>{row.rowName}</td>
                                
                                {row.incedents.map( element =>{
                                    return (
                                        <td key={shortid.generate()}>
                                            <div className='incedent_elem'>
                                                { <Tooltip data={element}/> }
                                            </div>
                                        </td>
                                    )
                                })}
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        )
    }
}

export default TableElement;