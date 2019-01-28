import React, { Component } from 'react';
import ProductForm from "./FormComponents/ProductForm";
import PricePick from "./FormComponents/PricePick";
import Options from "./FormComponents/Options"
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepContent from '@material-ui/core/StepContent';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import '../App.css';

function getSteps() {
  return [<span className='step-title'>Enter product name and URL</span>, <span className='step-title'>Choose the price to watch</span>, <span className='step-title'>Configure options</span>];
}

class ProductStepper extends React.PureComponent {

  getStepContent = (step) => {
    switch (step) {
      case 0:
        return <ProductForm addProduct={this.props.addProduct} handleNext={this.handleNext} productIsLoading={this.props.productIsLoading} productIsNotLoading={this.props.productIsNotLoading} loading={this.props.loading} error={this.props.error} hideError={this.props.hideError} response={this.props.response} />
      case 1:
        return <PricePick currentItem={this.props.currentItem} setPrice={this.props.setPrice} handleNext={this.props.handleNext} handleBack={this.props.handleBack} />
      case 2:
        return <div>
          <Options addTag={this.props.addTag} deleteTag={this.props.deleteTag} tags={this.props.currentItem.tags} addShipping={this.props.addShipping} />
          <Button variant="contained" color="primary" onClick={this.props.saveCurrent}>Watch Product</Button>
        </div>
      default:
        return 'Unknown step';
    }
  }

  render() {

    const steps = getSteps();
    const activeStep = this.props.stepper;

    return (
      <section className="add-product-wrapper wrapper">
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((label, index) => {
            return (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
                <StepContent>
                  <div>{this.getStepContent(index)}</div>
                </StepContent>
              </Step>
            );
          })}
        </Stepper>
        {activeStep === steps.length && (
          <Paper square elevation={0}>
            <Typography>All steps completed - you&quot;re finished</Typography>
            <Button onClick={this.props.handleReset} >
              Reset
            </Button>
          </Paper>
        )}
      </section>
    );
  }
}

export default ProductStepper;