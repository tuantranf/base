import React from "react";
import {
  Row,
  Col,
  Card,
  CardHeader,
  CardBlock,
} from "reactstrap";

import EditTable from "../../components/EditTable/EditTable";
import Base from "./Base";

class Edit extends Base {

  constructor(props) {
    super(props);
    this.setRelationRepository();
  }

  setRelationRepository() {
    this.relationRepositories = {};
  }

  bindMethods() {
    this.get = this.get.bind(this);
    this.handleOnSubmit = this.handleOnSubmit.bind(this);
    this.getRelationCandidates = this.getRelationCandidates.bind(this);
  }

  setInitialState(props) {
    this.state = {
      model: {},
      id: 0,
      relationModels: {},
      errors: {}
    };
  }

  componentWillMount() {
    let {id} = this.props.match.params;
    this.setState({
      id: id || 0,
    });
    if (id) {
      this.get(id);
    }
  }

  componentWillReceiveProps(newProps) {
  }

  handleOnSubmit(formData) {

    const id = this.state.id;
    if (id > 0) {
      this.repository.update(id, formData).then(repos => {
        if (repos.errorCode) {
          let errors = [];
          for (let i = 0; i < repos.invalidParams.length; i++) {
            errors[repos.invalidParams[i].name] = repos.invalidParams[i].message
          }
          this.setState({
            ...this.state,
            errors: errors
          });
          this.props.methods.errorMessage('Failed ' + repos.detail);
        } else {
          this.props.history.push(this.path + '/' + id);
          this.props.methods.successMessage('Successfully Updated ');
        }
      });
    } else {
      this.repository.store(formData).then(repos => {
        if (repos.errorCode) {
          let errors = [];
          for (let i = 0; i < repos.invalidParams.length; i++) {
            errors[repos.invalidParams[i].name] = repos.invalidParams[i].message
          }
          this.setState({
            ...this.state,
            errors: errors
          });
          this.props.methods.errorMessage('Failed ' + repos.detail);
        } else {
          this.props.methods.successMessage('Successfully Created ');
          this.props.history.push(this.path + '/' + repos.id);
        }
      });
    }
    return false;
  }

  get(id) {
    this.repository.show(id).then(repos => {
      this.setState({id: id, model: repos});
    }).catch(error => {
      this.props.methods.errorMessage('Data Fetch Failed. Please access again later');
    });
  }

  getRelationCandidates(name, searchWord) {
    if( !this.relationRepositories[name] ) {
      return Promise.resolve({ options: [] });
    }

    if (!searchWord) {
      return Promise.resolve({ options: [] });
    }

    const repository = this.relationRepositories[name];

    return repository.index(0, 100, '', '', searchWord, []).then(repos => {
      const relations = {...this.state.relationModels};
      relations[name] = repos.items;
      this.setState({
        'relationModels': relations
      });
      return {options: repos.items};
    }).catch(error => {
      this.props.methods.errorMessage('Data Fetch Failed. Please access again later');
    });
  }

  render() {
    return (
      <div className="animated fadeIn">
        <Row>
          <Col xs="12" lg="12">
            <Card>
              <CardHeader>
                {this.title}
              </CardHeader>
              <CardBlock className="card-body">
                <EditTable
                  columns={this.columns.edit}
                  columnInfo={this.columns.columns}
                  model={this.state.model}
                  selectCandidates={this.relationModels}
                  onSubmit={this.handleOnSubmit}
                  onSelect={this.getRelationCandidates}
                  errors={this.state.errors}
                />
              </CardBlock>
            </Card>
          </Col>
        </Row>
      </div>
    )
  }
}

export default Edit;
