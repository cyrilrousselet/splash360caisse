import DateFnsUtils from "@date-io/date-fns";
import AppBar from "@material-ui/core/AppBar";
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from "@material-ui/pickers";
import "date-fns";
import {
  compareAsc,
  endOfDay,
  endOfMonth,
  endOfToday,
  endOfWeek,
  format,
  startOfDay,
  startOfMonth,
  startOfToday,
  startOfWeek,
} from "date-fns";
import frLocale from "date-fns/locale/fr";
import React from "react";
import { Doughnut } from "react-chartjs-2";
import LocalizedStrings from "react-localization";
import { data } from "../constants/translations";
import TopZone from "../containers/TopZone";
import LoadingSpinner from "./common/LoadingSpinner";
import StdButton from "./common/StdButton";

let strings = new LocalizedStrings(data);

const _colorWheel = [
  "#FE485F",
  "#FDC24F",
  "#C784D5",
  "#1EA9DF",
  "#4A4A4A",
  "#554ED0",
  "#9EB3BB",
  "#EE7886",
  "#7D9FC7",
  "#ECA36A",
];

class LocalizedUtils extends DateFnsUtils {
  getDatePickerHeaderText(date) {
    return format(date, "d MMM yyyy", { locale: this.locale });
  }
}

// function TabPanel(props) {
//   const { children, value, index, ...other } = props;

//   return (
//     <Typography
//       component="div"
//       role="tabpanel"
//       hidden={value !== index}
//       id={`simple-tabpanel-${index}`}
//       aria-labelledby={`simple-tab-${index}`}
//       {...other}
//     >
//       {value === index && <Box p={3}>{children}</Box>}
//     </Typography>
//   );
// }

function CanalChart(props) {
  const { data } = props;
  console.log("Canal data ", data);

  let i = 0;
  const max = Object.values(data).sort((a, b) => b - a);

  const __items = Object.entries(data).map(([nom, valeur]) => (
    <div className="canal-item" key={`canal-${nom}`}>
      <div className="tracker">
        {`${valeur.toFixed(2).replace(".", ",")} €`}
        <div
          className="jauge"
          style={{
            backgroundColor: _colorWheel[i++],
            width: `calc(${Math.round((valeur / max[0]) * 100)}% - 4px)`,
          }}
        >{`${valeur.toFixed(2).replace(".", ",")} €`}</div>
      </div>
      <div className="nom">{nom}</div>
    </div>
  ));

  return <div className="CanalChart">{__items}</div>;
}

function MoyenChart(props) {
  const { data } = props;

  let i = 0;
  const max = Object.values(data).sort((a, b) => b - a);

  const __items = Object.entries(data).map(([nom, valeur]) => (
    <div className="moyen-item" key={`moyen-${nom}`}>
      <div className="tracker">
        <div
          className="jauge"
          style={{
            backgroundColor: _colorWheel[i++],
            height: `calc(${Math.round((valeur / max[0]) * 100)}% - 2px)`,
          }}
        ></div>
      </div>
      <div className="nom">{`${valeur.toFixed(2).replace(".", ",")} €`}</div>
    </div>
  ));

  i = 0;
  const __legende = Object.entries(data).map(([nom, valeur]) => (
    <div className="moyen-legende">
      <div className="spot" style={{ backgroundColor: _colorWheel[i++] }}></div>
      <div className="nom">
        {strings.modules.encaissement.reglement.moyens[nom]}
      </div>
    </div>
  ));

  return (
    <div className="MoyenChart">
      <div className="items">{__items}</div>
      <div className="legende">{__legende}</div>
    </div>
  );
}

function ModeChart(props) {
  const { data } = props;

  let i = 0;
  const max = Object.values(data).sort((a, b) => b - a);
  let total = 0;
  Object.values(data).forEach((val) => (total += val));

  const __items = Object.entries(data).map(([nom, valeur]) => (
    <div className="mode-item" key={`mode-${nom}`}>
      <div
        className="tracker"
        style={{
          backgroundImage: `linear-gradient(${_colorWheel[i]} 0%, ${_colorWheel[i]} 100%)`,
          height: `calc(${Math.round((valeur / max[0]) * 100)}% - 2px)`,
        }}
      >
        <div
          className="jauge"
          style={{
            backgroundColor: _colorWheel[i],
            width: `${Math.round((valeur / max[0]) * 50)}px`,
            height: `${Math.round((valeur / max[0]) * 50)}px`,
          }}
        >{`${Math.round((valeur / total) * 100)}%`}</div>
        <div
          className="point"
          style={{ backgroundColor: _colorWheel[i++] }}
        ></div>
      </div>
    </div>
  ));

  i = 0;
  const __legende = Object.entries(data).map(([nom, valeur]) => (
    <div className="mode-legende">
      <div className="spot" style={{ backgroundColor: _colorWheel[i++] }}></div>
      <div className="nom">{strings.modules.encaissement.panier.mode[nom]}</div>
    </div>
  ));

  return (
    <div className="ModeChart">
      <div className="items">{__items}</div>
      <div className="legende">{__legende}</div>
    </div>
  );
}

class Statistiques extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      openTab: 0,
      startDate: startOfToday(),
      endDate: endOfToday(),
    };
    // this.shouldComponentRender = this.shouldComponentRender.bind(this);
  }

  componentDidMount() {
    console.log("Statistiques.componentDidMount()");
    this.props.getCommandesList();
    this.props.getAllActive();
  }

  setSelectedDate(bound, date) {
    const { startDate, endDate } = this.state;
    if (bound === "start") {
      this.setState({
        startDate: date <= endDate ? startOfDay(date) : endDate,
      });
    }
    if (bound === "end") {
      this.setState({
        endDate: date >= startDate ? endOfDay(date) : startDate,
      });
    }
  }

  datesShortcut(short) {
    let startDate, endDate;
    switch (short) {
      case "jour":
        startDate = startOfToday();
        endDate = endOfToday();
        break;
      case "semaine":
        startDate = startOfWeek(new Date(), { weekStartsOn: 1 });
        endDate = endOfWeek(new Date(), { weekStartsOn: 1 });
        break;
      case "mois":
        startDate = startOfMonth(new Date());
        endDate = endOfMonth(new Date());
        break;
      default:
        startDate = startOfToday();
        endDate = endOfToday();
    }
    this.setState({ startDate: startDate, endDate: endDate });
  }

  render() {
    const { commandeslist, loading, canaux } = this.props;
    const { startDate, endDate } = this.state;

    let /*ca_total = 0,*/
      ca_confirmes = 0,
      nbre_total = 0,
      //  chrono_total = 0,
      nbre_confirmes = 0,
      tps_total = 0,
      canal = {},
      moyen = {},
      vendeur = {},
      mode = {};
    // for (let [key, value] of Object.entries(commandeslist)) {
    Object.values(commandeslist).forEach((value) => {
      // let cmd = {
      //   id: value.ticketId,
      //   createdAt: value.createdAt,
      //   date: format(new Date(value.createdAt), "d MMM yyyy", { locale: this.locale }),
      //   heure: format(new Date(value.createdAt), "H:mm:ss"),
      //   montant: `${value.total.toFixed(2).replace('.',',')} €`,
      //   client: 'Anonyme',
      //   caisse: value.caisse
      // };

      let __start = compareAsc(new Date(value.createdAt), startDate);
      let __end = compareAsc(new Date(value.createdAt), endDate);
      if (__start > -1 && __end < 1) {
        if (value.status === "confirmed") {
          ca_confirmes += Number(value.total);
          nbre_confirmes++;
        }
        nbre_total++;

        //   ca_total += Number(value.total);

        // calcul du temps moyen (uniquement pour les commandes chonométrées)
        tps_total += value.chrono || 0;
        //  if (value.chrono) chrono_total++;

        if (value.status === "confirmed") {
          // par mode
          if (!mode.hasOwnProperty(value.mode)) {
            mode[value.mode] = 0;
          }
          mode[value.mode] += Number(value.total);

          // par moyen
          value.reglements.forEach((rgl) => {
            if (!moyen.hasOwnProperty(rgl.moyen)) {
              moyen[rgl.moyen] = 0;
            }
            moyen[rgl.moyen] += Number(rgl.valeur);
          });
          // soustraction de la valeur du rendu-monnaie
          value.rendus.forEach((rdn) => {
            if (rdn.moyen === "especes") moyen[rdn.moyen] -= Number(rdn.valeur);
          });

          // par canal
          let can = canaux.find((cnl) => {
            console.log(cnl.ids);
            return cnl.ids.indexOf(value.caisse.id) > -1;
          });
          const nomcanal = can ? can.nom : value.caisse.id;
          if (!canal.hasOwnProperty(nomcanal)) {
            canal[nomcanal] = 0;
          }
          canal[nomcanal] += Number(value.total);

          // par vendeur
          if (!vendeur.hasOwnProperty(value.operator.nom)) {
            vendeur[value.operator.nom] = 0;
          }
          vendeur[value.operator.nom] += Number(value.total);
        }
      }
    });

    if (loading) {
      return <LoadingSpinner />;
    }

    // ventilation par vendeur
    const vendeur_data = {
      labels: [],
      datasets: [
        {
          data: [],
          backgroundColor: [],
          hoverBackgroundColor: [],
        },
      ],
    };
    let i = 0;
    Object.entries(vendeur).forEach(([id, val]) => {
      vendeur_data.labels.push(`${id} ${val.toFixed(2).replace(".", ",")}€`);
      vendeur_data.datasets[0].data.push(Math.round(val));
      vendeur_data.datasets[0].backgroundColor.push(_colorWheel[i]);
      vendeur_data.datasets[0].hoverBackgroundColor.push(_colorWheel[i++]);
    });

    const vendeur_options = {
      maintainAspectRation: true,
      responsive: true,
      legend: {
        position: "right",
      },
      cutoutPercentage: 75,
    };

    // const a11yProps = (index) => {
    //   return {
    //     id: `simple-tab-${index}`,
    //     'aria-controls': `simple-tabpanel-${index}`,
    //   };
    // }

    const panier_moyen = Number(ca_confirmes / nbre_confirmes) || 0;
    const nbsp = String.fromCharCode(160);

    return (
      <div className="Statistiques container">
        <TopZone />
        <div className="MainZone">
          <div className="listes">
            <AppBar position="static" className="liste-header">
              <div className="dates">
                <MuiPickersUtilsProvider
                  utils={LocalizedUtils}
                  locale={frLocale}
                >
                  <div className="caption">
                    {strings.modules.statistiques.pickers.du}
                  </div>
                  <KeyboardDatePicker
                    id="startdatepicker"
                    margin="normal"
                    value={startDate}
                    format="d MMM yyyy"
                    onChange={(date) => {
                      this.setSelectedDate("start", date);
                    }}
                    KeyboardButtonProps={{ "aria-label": "change date" }}
                    clearLabel={strings.general.dialog.clear}
                    cancelLabel={strings.general.dialog.cancel}
                  />
                  <div className="caption">
                    {strings.modules.statistiques.pickers.au}
                  </div>
                  <KeyboardDatePicker
                    id="enddatepicker"
                    margin="normal"
                    value={endDate}
                    format="d MMM yyyy"
                    onChange={(date) => {
                      this.setSelectedDate("end", date);
                    }}
                    KeyboardButtonProps={{ "aria-label": "change date" }}
                    clearLabel={strings.general.dialog.clear}
                    cancelLabel={strings.general.dialog.cancel}
                  />
                </MuiPickersUtilsProvider>
              </div>
              <div className="shortcuts">
                <StdButton
                  key="short-jour"
                  identifier="jour"
                  elementclass="shortcut shortcut-jour"
                  text={strings.modules.statistiques.shortcut.jour}
                  noStroke={true}
                  onClick={() => {
                    this.datesShortcut("jour");
                  }}
                />
                <StdButton
                  key="short-semaine"
                  identifier="semaine"
                  elementclass="shortcut shortcut-semaine"
                  text={strings.modules.statistiques.shortcut.semaine}
                  noStroke={true}
                  onClick={() => {
                    this.datesShortcut("semaine");
                  }}
                />
                <StdButton
                  key="short-mois"
                  identifier="mois"
                  elementclass="shortcut shortcut-mois"
                  text={strings.modules.statistiques.shortcut.mois}
                  noStroke={true}
                  onClick={() => {
                    this.datesShortcut("mois");
                  }}
                />
              </div>
            </AppBar>

            <div className="panel">
              <div className="zonebtn">
                <StdButton
                  key="ca"
                  identifier="ca"
                  elementclass="action action-ca"
                  noStroke={false}
                  text={`${strings.modules.statistiques.totaux.ca} ${
                    ca_confirmes.toFixed(2).replace(".", ",") + nbsp
                  }€`}
                  onClick={() => void 0}
                />
                <StdButton
                  key="nbrcmd"
                  identifier="nbrcmd"
                  elementclass="action action-nbrcmd"
                  noStroke={false}
                  text={`${strings.modules.statistiques.totaux.tickets} ${nbre_confirmes}`}
                  onClick={() => void 0}
                />
                <StdButton
                  key="cart"
                  identifier="cart"
                  elementclass="action action-cart"
                  noStroke={false}
                  text={`${strings.modules.statistiques.totaux.moyen} ${
                    panier_moyen.toFixed(2).replace(".", ",") + nbsp
                  }€`}
                  onClick={() => void 0}
                />
                <StdButton
                  key="tpscmd"
                  identifier="tpscmd"
                  elementclass="action action-tpscmd"
                  noStroke={false}
                  text={`${strings.modules.statistiques.totaux.chrono} ${
                    isNaN(tps_total / nbre_total)
                      ? 0
                      : Number(tps_total / nbre_total)
                          .toFixed(2)
                          .replace(".", ",") + nbsp
                  }SEC`}
                  onClick={() => void 0}
                />
              </div>
              <div className="zonecharts">
                <div className="chartblock chart-canal">
                  <div className="chart-titre">
                    {strings.modules.statistiques.charts.canal}
                  </div>
                  <div className="chartcont">
                    <CanalChart data={canal} />
                  </div>
                </div>
                <div className="chartblock chart-moyen">
                  <div className="chart-titre">
                    {strings.modules.statistiques.charts.moyen}
                  </div>
                  <div className="chartcont">
                    <MoyenChart data={moyen} />
                  </div>
                </div>
                <div className="chartblock chart-mode">
                  <div className="chart-titre">
                    {strings.modules.statistiques.charts.mode}
                  </div>
                  <div className="chartcont">
                    <ModeChart data={mode} />
                  </div>
                </div>
                <div className="chartblock chart-vendeur">
                  <div className="chart-titre">
                    {strings.modules.statistiques.charts.vendeur}
                  </div>
                  <div className="chartcont chart-doughnut">
                    <Doughnut data={vendeur_data} options={vendeur_options} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
export default Statistiques;

// Cloture.propTypes = {
//   catalogue: PropTypes.array,
//   loading: PropTypes.bool,
//   error: PropTypes.string,
//   getAllActive: PropTypes.func
// }
