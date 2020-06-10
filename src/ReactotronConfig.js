import { reactotronRedux } from 'reactotron-redux';
import Reactotron from 'reactotron-react-js'

const reactotron = Reactotron
  .configure() // we can use plugins here -- more on this later
  .use(reactotronRedux())
  .connect() // let's connect!

  export default reactotron;