import styled from 'styled-components';

const Wrapper = styled.div`
  display: flex;
  width: 100%;
  justify-content: flex-end;
  margin-top: -2px;
  > div {
    display: inline-flex;
    flex-direction: row;
    min-width: 120px;
    height: 32px;
    overflow: hidden;
  }
  .paginationNavigator {
    position: relative;
    width: 36px;
    text-align: center;
    line-height: 30px;
    font-size: 1.0rem;
    i,
    svg {
      color: #97999e;
    }
    &:first-of-type {
      margin-right: 10px;
      &:after {
        content: '';
        position: absolute;
        top: 3px;
        bottom: 3px;
        right: 0;
        width: 1px;
        background: #f1f1f2;
      }
    }
    &:last-of-type {
      margin-left: 10px;
      &:before {
        content: '';
        position: absolute;
        top: 3px;
        bottom: 3px;
        left: 0;
        width: 1px;
        background: #f1f1f2;
      }
    }
    &[disabled] {
      i,
      svg {
        opacity: 0.3;
      }
    }
  }
  .navWrapper {
    min-width: 48px;
    ul {
      display: flex;
      flex-direction: row;
      justify-content: center;
      height: 100%;
      margin: 0 -5px;
      padding: 0;
    }
    li {
      position: relative;
      min-width: 15px;
      margin: 0 5px !important;
      text-align: center;
      align-self: center;
      color: #333740;
      a {
        color: #333740;
        font-size: 1.0rem;
        text-decoration: none;
        &:hover,
        &:visited,
        &:focus,
        &:active {
          text-decoration: none;
          color: #333740;
        }
      }
    }
  }
  .navUl {
    display: flex;
    flex-direction: row;
    justify-content: center;
    margin: 0;
    padding: 0;
  }
  .navLiActive {
    align-self: center;
    font-weight: 800;
    background: #ffffff;
    padding: 12px;
    border-radius: 4px;
    box-shadow: rgb(33 33 52 / 10%) 0px 1px 4px;
  }
`;

export default Wrapper;