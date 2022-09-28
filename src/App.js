import React from "react";
import { Row, Col, Spin, Empty } from "antd";
import Card from "./components/Card";

import styles from "./App.module.scss";

const cities = ["Ottawa", "Moscow", "Tokyo"];
const apiKey = "e47851098af3179c1a8ee53df6ee4a93";

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedCity: cities[0],
      isLoading: false,
      weatherData: null,
      hasError: null,
    };
  }

  componentDidMount() {
    const { selectedCity } = this.state;

    this.getWeatherForCity(selectedCity);
  }

  getWeatherForCity = (city) => {
    this.setState({ isLoading: true, weatherData: null, hasError: null });

    fetch(
      `https://api.openweathermap.org/data/2.5/forecast/daily?q=${city}&appid=${apiKey}&units=metric`
    )
      .then((res) => {
        if (res.ok) {
          return res.json();
        }

        throw new Error("Server Error");
      })
      .then((res) =>
        this.setState({
          isLoading: false,
          weatherData: {
            ...res,
            list: res.list
              .sort((prev, next) => prev.dt - next.dt)
              .map((forecast) => ({
                ...forecast,
                date: new Date(forecast.dt * 1000 - res.city.timezone * 1000),
              })),
          },
        })
      )
      .catch((err) =>
        this.setState({
          isLoading: false,
          hasError: err,
        })
      );
  };

  handleCitySelect = (selectedCity) => {
    this.setState({ selectedCity });

    this.getWeatherForCity(selectedCity);
  };

  render() {
    const { selectedCity, isLoading, hasError, weatherData } = this.state;
    const noopUrl = "#";

    if (isLoading) {
      return (
        <Row
          justify="center"
          align="middle"
          style={{ width: "100vw", height: "100vh" }}
        >
          <Col span={24} style={{ textAlign: "center" }}>
            <Spin />
          </Col>
        </Row>
      );
    }

    if (hasError) {
      return <div>An error occurred while fetching data. {hasError}</div>;
    }

    if (
      !weatherData ||
      (weatherData && Object.keys(weatherData).length === 0)
    ) {
      return <Empty />;
    }

    return (
      <>
        <Row justify="center" align="middle">
          <Col xs={24} md={20} lg={16} xl={12} xxl={4}>
            <div className={styles.cityLinks}>
              {cities.map((city) => (
                <a
                  key={city}
                  href={noopUrl}
                  className={city === selectedCity ? styles.active : ""}
                  onClick={() => this.handleCitySelect(city)}
                >
                  {city.toUpperCase()}
                </a>
              ))}
            </div>
          </Col>
        </Row>

        <Row justify="center" align="middle">
          <Col xs={24} md={20} lg={16} xl={12} xxl={4}>
            <Card>
              <div className={styles.todaySection}>
                <div className={styles.todayTitle}>Today</div>
                <div>
                  <img
                    src={`http://openweathermap.org/img/w/${weatherData.list[0].weather[0].icon}.png`}
                    alt={weatherData.list[0].weather[0].description}
                  />
                  <div>
                    <div className={styles.todayDeg}>
                      {Math.round(weatherData.list[0].temp.day)}&deg;
                    </div>
                    <div>{weatherData.list[0].weather[0].main}</div>
                  </div>
                </div>
              </div>

              <Row justify="center">
                {weatherData.list.slice(1, 5).map((forecast) => (
                  <Col
                    key={`forecast-${forecast.date.toString().split(" ")[0]}`}
                    className={styles.forecastBorder}
                    xs={6}
                  >
                    <div className={styles.forecastSection}>
                      {forecast.date.toString().split(" ")[0]}
                      <img
                        src={`http://openweathermap.org/img/w/${forecast.weather[0].icon}.png`}
                        alt={forecast.weather[0].description}
                      />
                      {Math.round(forecast.temp.day)}&deg;
                    </div>
                  </Col>
                ))}
              </Row>
            </Card>
          </Col>
        </Row>
      </>
    );
  }
}
