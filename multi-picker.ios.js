/**
 * Copyright (c) 2015-present Dave Vedder
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule MultiPickerIOS
 *
 */
'use strict';

import React from 'react';
import {StyleSheet, View, NativeModules, requireNativeComponent} from 'react-native';
import PropTypes from 'prop-types';

var RNMultiPickerConsts = NativeModules.UIManager.RNMultiPicker.Constants;
var PICKER_REF = 'picker';

var MultiPickerIOS = React.createClass({
  propTypes: {
    componentData: PropTypes.any,
    selectedIndexes: PropTypes.array,
    onChange: PropTypes.func,
  },

  getInitialState() {
    var componentData = [];
    var selectedIndexes = [];

    React.Children.forEach(this.props.children, (child, index) => {
      var items = []

      var selectedIndex = 0;
      if (child.props.selectedIndex) {
        selectedIndex = child.props.selectedIndex;
      } else if (child.props.initialSelectedIndex && !this.state) {
        selectedIndex = child.props.initialSelectedIndex;
      }

      React.Children.forEach(child.props.children, function (child, idx) {
        items.push({label: child.props.label, value: child.props.value});
      });

      componentData.push(items);
      selectedIndexes.push(selectedIndex);
    });

    return {componentData, selectedIndexes,};
  },

  _onChange(event) {
    var nativeEvent = event.nativeEvent;

    // Call any change handlers on the component itself
    if (this.props.onChange) {
      this.props.onChange(nativeEvent);
    }

    if (this.props.valueChange) {
      this.props.valueChange(nativeEvent);
    }

    // Call any change handlers on the child component picker that changed
    // if it has one. Doing it this way rather than storing references
    // to child nodes and their onChage props in _stateFromProps because
    // React docs imply that may not be a good idea.
    React.Children.forEach(this.props.children, function (child, idx) {
      if (idx === nativeEvent.component && child.props.onChange) {
        child.props.onChange(nativeEvent);
      }
    });

    var nativeProps = {
      componentData: this.state.componentData,
    };

    nativeProps.selectedIndexes = this.state.selectedIndexes;
    this.refs[PICKER_REF].setNativeProps(nativeProps);
  },

  render() {
    return (
      <View style={this.props.style}>
        <RNMultiPicker
          ref={PICKER_REF}
          style={styles.multipicker}
          selectedIndexes={this.state.selectedIndexes}
          componentData={this.state.componentData}
          onChange={this._onChange}/>
      </View>
    );
  },
});

// Represents a "section" of a picker.
MultiPickerIOS.Group = React.createClass({
  propTypes: {
    items: React.PropTypes.array,
    selectedIndex: React.PropTypes.number,
    onChange: React.PropTypes.func,
  },

  render() {
    return null;
  },
});

// Represents an item in a picker section: the `value` is used for setting /
// getting selection
//
MultiPickerIOS.Item = React.createClass({
  propTypes: {
    value: React.PropTypes.any.isRequired, // string or integer basically
    label: React.PropTypes.string.isRequired, // for display
  },

  render() {
    return null;
  },
});

var styles = StyleSheet.create({
  multipicker: {
    height: RNMultiPickerConsts.ComponentHeight,
  },
});

var RNMultiPicker = requireNativeComponent('RNMultiPicker', MultiPickerIOS);
module.exports = MultiPickerIOS;
