
class Chart {
    constructor() {
        // Defining state attributes
        const attrs = {
            id: "ID" + Math.floor(Math.random() * 1000000),
            svgWidth: 400,
            svgHeight: 200,
            marginTop: 25,
            marginBottom: 25,
            marginRight: 25,
            marginLeft: 35,
            container: "body",
            defaultTextFill: "#2C3E50",
            defaultFont: "Helvetica",
            data: null,
            chartWidth: null,
            chartHeight: null
        };

        // Defining accessors
        this.getState = () => attrs;
        this.setState = (d) => Object.assign(attrs, d);

        // Automatically generate getter and setters for chart object based on the state properties;
        Object.keys(attrs).forEach((key) => {
            //@ts-ignore
            this[key] = function (_) {
                if (!arguments.length) {
                    return attrs[key];
                }
                attrs[key] = _;
                return this;
            };
        });

        // Custom enter exit update pattern initialization (prototype method)
        this.initializeEnterExitUpdatePattern();
    }


    render() {
        this.setDynamicContainer();
        this.calculateProperties();
        this.drawSvgAndWrappers();
        this.drawRects();
        return this;
    }

    calculateProperties() {
        const {
            marginLeft,
            marginTop,
            marginRight,
            marginBottom,
            svgWidth,
            svgHeight
        } = this.getState();

        //Calculated properties
        var calc = {
            id: null,
            chartTopMargin: null,
            chartLeftMargin: null,
            chartWidth: null,
            chartHeight: null
        };
        calc.id = "ID" + Math.floor(Math.random() * 1000000); // id for event handlings
        calc.chartLeftMargin = marginLeft;
        calc.chartTopMargin = marginTop;
        const chartWidth = svgWidth - marginRight - calc.chartLeftMargin;
        const chartHeight = svgHeight - marginBottom - calc.chartTopMargin;

        this.setState({
            calc,
            chartWidth,
            chartHeight
        });
    }

    drawRects() {
        const {
            chart,
            data,
            chartWidth,
            chartHeight
        } = this.getState();

        const realData = d3.json('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json')
            .then(data => {


                const useableData = data.data

                const maxGdp = Math.round(d3.max(useableData, d => d[1]) / 1000) * 1000;
                const gdpLineStep = 2000
                const gdpStrokeLineCount = maxGdp / gdpLineStep
                const gdpLineStepValue = chartHeight / gdpStrokeLineCount
                const gdpLineData = []

                for (let i = 0; i <= gdpStrokeLineCount; i++) {
                    const val = gdpLineStep * i
                    gdpLineData.push(val)
                }



                const gdpLine = chart._add({
                        tag: 'line',
                        className: 'gdp-line'
                    })
                    .attr('x1', 40)
                    .attr('y1', 0)
                    .attr('x2', 40)
                    .attr('y2', chartHeight)
                    .attr('stroke', 'black')
                    .attr('stroke-width', 2)

                const gdpLineStrokes = chart._add({
                        tag: 'line',
                        className: 'gdp-line-strokes',
                        data: gdpLineData
                    })
                    .attr('x1', 30)
                    .attr('y1', (d, i) => {
                        return i * gdpLineStepValue
                    })
                    .attr('x2', 40)
                    .attr('y2', (d, i) => {
                        return i * gdpLineStepValue
                    })
                    .attr('stroke', 'black')
                    .attr('stroke-width', 2)


                const gdpLineLabels = chart._add({
                        tag: 'foreignObject',
                        className: 'gdp-line-label',
                        data: gdpLineData
                    })
                    .attr('x', -20)
                    .attr('y', (d, i) => chartHeight - (i * gdpLineStepValue) - 10)
                    .attr('width', 50)
                    .attr('height', 30)
                    .append('xhtml:div')
                    .html((d, i) => `<div style="text-align: right;">${d}</div>`)

                const maxYear = +d3.max(useableData, d => d[0]).split('-')[0]
                const minYear = Math.round(+d3.min(useableData, d => d[0].split('-')[0]) / 50) * 50;
                const yearData = ['', ]

                for (let i = minYear; i <= maxYear; i += 5) {
                    yearData.push(i)
                }

                const yearLineStep = chartWidth / yearData.length + 3.56

                const yearLine = chart._add({
                        tag: 'line',
                        className: 'year-line'
                    })
                    .attr('x1', 40)
                    .attr('y1', chartHeight)
                    .attr('x2', chartWidth)
                    .attr('y2', chartHeight)
                    .attr('stroke', 'black')
                    .attr('stroke-width', 2)

                const yearLineStrokes = chart._add({
                        tag: 'line',
                        className: 'year-line-strokes',
                        data: yearData
                    })
                    .attr('x1', (d, i) => i * yearLineStep + 40)
                    .attr('y1', chartHeight)
                    .attr('x2', (d, i) => i * yearLineStep + 40)
                    .attr('y2', chartHeight + 10)
                    .attr('stroke', 'black')
                    .attr('stroke-width', 2)


                const yearLineLabels = chart._add({
                        tag: 'foreignObject',
                        className: 'year-line-label',
                        data: yearData
                    })
                    .attr('x', (d, i) => i * yearLineStep + 5)
                    .attr('y', chartHeight + 10)
                    .attr('width', 50)
                    .attr('height', 30)
                    .append('xhtml:div')
                    .html((d, i) => `<div style="text-align: right;">${d}</div>`)

                const rectWidth = (chartWidth - 40) / useableData.length

                const heightScale = d3.scaleLinear()
                    .domain([0, d3.max(useableData, d => d[1])])
                    .range([0, chartHeight]);



                const rects = chart._add({
                        tag: 'rect',
                        className: 'main-rects',
                        data: useableData
                    })
                    .attr('x', (d, i) => 40 + rectWidth * i)
                    .attr('y', chartHeight)
                    .attr('width', rectWidth)
                    .attr('fill', '#5c93eb')
                    .transition()
                    .duration((d, i) => i * 6)
                    .attr('height', d => heightScale(d[1]))
                    .attr('y', (d) => chartHeight - heightScale(d[1]))

                    

                rects.each(function(d)  {

                    const month = d[0].split('-')[1]


                    const quarter = month < 4 ? 'Q1' : (month < 7 ? 'Q2' : (month < 10 ? 'Q3' : 'Q4'));
                   
                    tippy(this, {
                        content: `

                        <div>
                        <div>${d[0].split('-')[0]}  ${quarter} </div>
                        <div>$${d[1]} Billion</div>
                        </div>
                          
                        `,
                        trigger: 'mouseenter',
                        placement: 'right',
                        animation: 'fade', // Options: 'fade', 'scale', 'shift-toward', 'perspective', 'fade-backward'
                        duration: [200, 100], // Duration for showing and hiding (in milliseconds)
                        allowHTML: true
                    })

                    this.addEventListener('mouseenter', () => {
                        this.style.opacity = 0.5; 
                    });
                
                    this.addEventListener('mouseleave', () => {
                        this.style.opacity = 1; 
                    });
                })

              

             

            })


    }

    drawSvgAndWrappers() {
        const {
            d3Container,
            svgWidth,
            svgHeight,
            defaultFont,
            calc,
            data,
            chartWidth,
            chartHeight
        } = this.getState();

        // Draw SVG
        const svg = d3Container
            ._add({
                tag: "svg",
                className: "svg-chart-container"
            })
            .attr("width", svgWidth)
            .attr("height", svgHeight)
            .attr("font-family", defaultFont);

        //Add container g element
        var chart = svg
            ._add({
                tag: "g",
                className: "chart"
            })
            .attr(
                "transform",
                "translate(" + calc.chartLeftMargin + "," + calc.chartTopMargin + ")"
            );

        // chart
        //     ._add({
        //         tag: "rect",
        //         selector: "rect-sample",
        //         data: [data]
        //     })
        //     .attr("width", chartWidth)
        //     .attr("height", chartHeight)
        //     .attr("fill", (d) => d.color);

        this.setState({
            chart,
            svg
        });
    }

    initializeEnterExitUpdatePattern() {
        d3.selection.prototype._add = function (params) {
            var container = this;
            var className = params.className;
            var elementTag = params.tag;
            var data = params.data || [className];
            var exitTransition = params.exitTransition || null;
            var enterTransition = params.enterTransition || null;
            // Pattern in action
            var selection = container.selectAll("." + className).data(data, (d, i) => {
                if (typeof d === "object") {
                    if (d.id) {
                        return d.id;
                    }
                }
                return i;
            });
            if (exitTransition) {
                exitTransition(selection);
            } else {
                selection.exit().remove();
            }

            const enterSelection = selection.enter().append(elementTag);
            if (enterTransition) {
                enterTransition(enterSelection);
            }
            selection = enterSelection.merge(selection);
            selection.attr("class", className);
            return selection;
        };
    }

    setDynamicContainer() {
        const attrs = this.getState();

        //Drawing containers
        var d3Container = d3.select(attrs.container);
        var containerRect = d3Container.node().getBoundingClientRect();
        if (containerRect.width > 0) attrs.svgWidth = containerRect.width;

        d3.select(window).on("resize." + attrs.id, function () {
            var containerRect = d3Container.node().getBoundingClientRect();
            if (containerRect.width > 0) attrs.svgWidth = containerRect.width;
            this.render();
        });

        this.setState({
            d3Container
        });
    }
}