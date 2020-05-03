import {
  html
} from "lit-element";
import {Current, Forecast, IconsConfig} from "./types";
import {HomeAssistant} from "custom-card-helpers/dist";
import {getUnit, getWeatherIcon} from "./ha-cwc-utils" ;

/**
 *
 * @param entity_low
 * @param entity_unit_low
 * @param entity_high
 * @param entity_unit_high
 * @private
 */
const _renderForecast = (entity_low: number, entity_unit_low: string,
                         entity_high: number, entity_unit_high: string) => {
  if (undefined == entity_low && undefined == entity_high) {
    return html``;
  } else if (undefined == entity_low) {
    return html`
            <div class="highTemp">
              <b>${entity_high}</b> ${entity_unit_high}
            </div>   
      `;
  } else if (undefined == entity_high) {
    return html`
            <div class="lowTemp">
              ${entity_low} ${entity_unit_low}
            </div>  
      `;
  } else {
    return html`
            <div class="highTemp">
              ${entity_low} ${entity_unit_low} / <b>${entity_high} ${entity_unit_high}</b>
            </div>
      `;
  }
} ;

export const renderForecasts = (hass: HomeAssistant, currentCfg: Current, forecastCfg: Forecast, iconsConfig: IconsConfig, lang: string) => {
  let forecastDate = new Date();
  let sun = hass.states[currentCfg.sun].state;

  let icons: [string, any][] = forecastCfg.icons
    ? Object.entries(forecastCfg.icons) : undefined;
  let temperature_high: [string, number][] = forecastCfg.temperature_high
    ? Object.entries(forecastCfg.temperature_high) : undefined;
  let temperature_low: [string, number][] = forecastCfg.temperature_low
    ? Object.entries(forecastCfg.temperature_low) : undefined;
  let precipitation_probability: [string, number][] = forecastCfg.precipitation_probability
    ? Object.entries(forecastCfg.precipitation_probability) : undefined;
  let precipitation_intensity: [string, number][] = forecastCfg.precipitation_intensity
    ? Object.entries(forecastCfg.precipitation_intensity) : undefined;

  let maxDays = Math.max(icons ? icons.length : 0,
    temperature_high ? temperature_high.length : 0, temperature_low ? temperature_low.length : 0,
    precipitation_probability ? precipitation_probability.length : 0,
    precipitation_intensity ? precipitation_intensity.length : 0);

  let startDay = 1;
  let days = maxDays > 0 ?
    Array(maxDays - startDay).fill(1, 0, maxDays - startDay).map(() => startDay++)
    : Array();

  return maxDays > 1 ? html`
      <div class="forecast clear ${2 > 1 ? "spacer" : ""}">
        ${days.map(day => {
    let date = new Date(forecastDate.setDate(forecastDate.getDate() + 1))
      .toLocaleDateString(lang, {weekday: "short"});
    let icon = icons ? hass.states[icons[day][1]].state.toLowerCase() : undefined;

    let day_temp_low = temperature_low 
      ? Math.round(parseFloat(hass.states[temperature_low[day][1]].state)) : undefined ;
    let day_temp_high = temperature_high
      ? Math.round(parseFloat(hass.states[temperature_high[day][1]].state)) : undefined ;
    let day_prec_probab = precipitation_probability
      ? Math.round(parseFloat(hass.states[precipitation_probability[day][1]].state)) : undefined ;
    let day_prec_intensity = precipitation_intensity 
      ? Math.round(parseFloat(hass.states[precipitation_intensity[day][1]].state)) : undefined ;
    
    return html`
          <div class="day ${day}">
              <div class="dayname">${date}</div>
              ${icon ? html`
              <i class="icon" style="background: none, url('${getWeatherIcon(icon, iconsConfig, sun)}') no-repeat; 
                    background-size: contain"></i>                
              ` : ""}
              ${_renderForecast(day_temp_low, '', day_temp_high, getUnit(hass,"temperature"))} 
              ${_renderForecast(day_prec_probab, '%', day_prec_intensity, 
              getUnit(hass,"precipitation") + '/h')}                       
          </div>
          `;
  })}
      </div>
    ` : html``;

} ;

