#!/usr/bin/env node

import chalk from "chalk"
import dedent from "dedent-js"
import { getArgs } from "./helpers/args.js"
import { getWeather } from "./services/api.service.js"
import { printError, printHelp, printSuccess } from "./services/log.service.js"
import { saveKeyValue, getKeyValue, TOKEN_DICTIONARY } from "./services/storage.service.js"

class WeatherCLI {
	args = getArgs(process.argv)

	init() {
		if (this.args.h) {
			printHelp()
		}
		if (this.args.c) {
			return this.saveCity(this.args.c)
		}
		if (this.args.t) {
			return this.saveToken(this.args.t)
		}
		this.getForcast()
	}

	async saveToken(token) {
		if (!token.length) {
			printError("Не передан токен")
			return
		}
		try {
			await saveKeyValue(TOKEN_DICTIONARY.token, token)
			printSuccess("Токен сохранён")
		} catch (err) {
			printError(err.message)
		}
	}

	async saveCity(city) {
		if (!city.length) {
			printError("Не передан город")
			return
		}
		try {
			await saveKeyValue(TOKEN_DICTIONARY.city, city)
			printSuccess("Город сохранён")
		} catch (err) {
			printError(err.message)
		}
	}

	async getForcast() {
		try {
			const data = await getWeather(process.env.CITY ?? (await getKeyValue("city")))
			console.log(dedent`
				${chalk.bold.bgBlue(" Город ")}: ${data?.name}
				${chalk.bold.bgMagenta(" Погода ")}: ${data?.weather[0]?.main}
				${chalk.bold.bgBlueBright(" Описание ")}: ${data?.weather[0]?.description}
				${chalk.bold.bgYellowBright(" Температура ")}: ${data?.main?.temp}
				${chalk.bold.bgGreen(" Чувствуется как ")}: ${data?.main?.feels_like}
				${chalk.bold.bgCyanBright(" Геолокация ")}: широта ${data?.coord.lon} долгота ${data?.coord?.lat}
			`)
		} catch (err) {
			if (err?.response?.status === 404) {
				printError("Неверно указан город")
			} else if (err?.response?.status === 401) {
				printError("Неверно указан токен")
			} else {
				printError(err.message)
			}
		}
	}
}

const data = new WeatherCLI()

data.init()
