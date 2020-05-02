import React from 'react';
import './styles.css';

import styled from "styled-components";

const FullPageContainer = styled.div`
  display: grid;
  
  height: 100vh;
  width: 100vw;
`;

export default class App extends React.Component<any, any> {
  render() {
    return (
      <FullPageContainer>
        Hello world
      </FullPageContainer>
    )
  }
}
