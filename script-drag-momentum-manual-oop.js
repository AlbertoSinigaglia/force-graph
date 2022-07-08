class Graph{
    constructor(scaleToSize, adjacencyMatrix, startingCoordinates = [], printScale = 0.4, coefficients = {connected: 1, notConnected: 1, all: 1}){
        this.adjMatrix = JSON.parse(JSON.stringify(adjacencyMatrix))
        startingCoordinates = startingCoordinates || this.adjMatrix.map(_ => [Math.random() - 0.5,Math.random()  - 0.5])
        this.positions = JSON.parse(JSON.stringify(startingCoordinates))
        this.previousPosition = JSON.parse(JSON.stringify(startingCoordinates))
        this.currentDragged = -1
        this.beta = 0.1
        this.stepsize = 0.01;
        this.scaleToSize = scaleToSize
        this.printScale = printScale
        this.coefficients = coefficients
    }
    calculateGradients(){
        const res = []
        for(let i = 0; i < this.adjMatrix.length; i++){
            const temp = [0, 0];
            for(let j = 0; j < this.adjMatrix.length; j++){
                if(i != j){
                        temp[0] += this.coefficients.connected * (this.adjMatrix[i][j]) * 
                                (this.positions[i][0] - this.positions[j][0]) * 2
                        temp[1] += this.coefficients.connected * (this.adjMatrix[i][j]) * 
                                (this.positions[i][1] - this.positions[j][1]) * 2
                }
            }
            for(let j = 0; j < this.adjMatrix.length; j++){
                if(i != j){
                        temp[0] +=  -(this.coefficients.notConnected*(1 - this.adjMatrix[i][j]) + this.coefficients.all) * (this.positions[i][0] - this.positions[j][0]) / 
                                    Math.pow(Math.pow(this.positions[i][0] - this.positions[j][0],2) + Math.pow(this.positions[i][1] - this.positions[j][1],2),2)
                        temp[1] +=  -(this.coefficients.notConnected*(1 - this.adjMatrix[i][j]) + this.coefficients.all) * (this.positions[i][1] - this.positions[j][1]) / 
                                    Math.pow(Math.pow(this.positions[i][0] - this.positions[j][0],2) + Math.pow(this.positions[i][1] - this.positions[j][1],2),2)
                }
            }


            temp[0] += this.positions[i][0]
            temp[1] += this.positions[i][1]
            res.push(temp)
        }
        return res
    }
    updatePositions(){
        let y = []
        for(let i = 0; i < this.adjMatrix.length; i++){
            y.push([
                this.positions[i][0] + this.beta * (this.positions[i][0] - this.previousPosition[i][0]),
                this.positions[i][1] + this.beta * (this.positions[i][1] - this.previousPosition[i][1])
            ])
        }
        let grad = this.calculateGradients(y)
        this.previousPosition = JSON.parse(JSON.stringify(this.positions))
        for(let i = 0; i < this.adjMatrix.length; i++){
            if(i != this.currentDragged || this.currentDragged == -1){
                this.positions[i][0] = y[i][0] - this.stepsize * (Math.sign(grad[i][0]) * Math.min(Math.abs(grad[i][0]), 1))
                this.positions[i][1] = y[i][1] - this.stepsize * (Math.sign(grad[i][1]) * Math.min(Math.abs(grad[i][1]), 1))
            } else {
                this.positions[this.currentDragged][0] -= 0.05 * (this.positions[this.currentDragged][0] - this.dragPosition.x / (Math.min(this.scaleToSize.width, this.scaleToSize.height)/2 * this.printScale))
                this.positions[this.currentDragged][1] -= 0.05 * (this.positions[this.currentDragged][1] - this.dragPosition.y / (Math.min(this.scaleToSize.width, this.scaleToSize.height)/2 * this.printScale))
            }
        }
    }
    scaledPositions(){
        return this.positions.map(p => [
            (p[0]) * Math.min(this.scaleToSize.width, this.scaleToSize.height)/2 * this.printScale,
            (p[1]) * Math.min(this.scaleToSize.width, this.scaleToSize.height)/2 * this.printScale
        ])
    }
    loss(){
        let total = 0
        for(let i = 0; i < this.adjMatrix.length; i++){
            for(let j = 0; j < this.adjMatrix.length; j++){
                if(i != j){
                    total += this.adjMatrix[i][j] * (Math.pow(this.positions[i][0] - this.positions[j][0], 2) + Math.pow(this.positions[i][1] - this.positions[j][1], 2))+
                            (1-this.adjMatrix[i][j]) * 1/(Math.pow(this.positions[i][0] - this.positions[j][0], 2) + Math.pow(this.positions[i][1] - this.positions[j][1], 2))+
                            1/(Math.pow(this.positions[i][0] - this.positions[j][0], 2) + Math.pow(this.positions[i][1] - this.positions[j][1], 2))
                }
            }
        }
        return total
    }
    isDragging(){
        return this.currentDragged != -1
    }
    stopDragging(){
        this.currentDragged = -1
    }
    startDragging(dragPosition){
        let min = Infinity
        let index = -1
        let pseudoPositions = this.scaledPositions()
        for(let i = 0 ; i < this.adjMatrix.length; i++){
            let p = pseudoPositions[i]
            if(Math.sqrt(Math.pow(p[0] - dragPosition.x,2) + Math.pow(p[1] - dragPosition.y,2)) < min){
                min = Math.sqrt(Math.pow(p[0] - dragPosition.x,2) + Math.pow(p[1] - dragPosition.y,2))
                index = i
            }
        }
        this.dragPosition = dragPosition
        this.currentDragged = index
    }
    dragTo(dragPosition){
        if(this.isDragging()){
            this.dragPosition = dragPosition
        }
    }
    currentDraggedId(){
        return this.currentDragged
    }
    getAdjMatrix(){
        return JSON.parse(JSON.stringify(this.adjMatrix))
    }
}

class LineChart{
    constructor(ctx, title){
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
              labels: [],
              datasets: [{ 
                  data: [],
                  borderColor: "#3e95cd",
                  fill: false
                }
              ]
            },
            options: {
                scales: {
                    x: {
                      display: true,
                    },
                    y: {
                      display: true,
                      type: 'logarithmic',
                    }
                  },
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                      display: true,
                      text: title,
                      font: {
                            size: 30
                      }
                    }
                },
              }
        });
    }
    addPoint(point){
        const data = this.chart.data;
        data.labels.push(data.datasets[0].data.length+1)
        data.datasets[0].data.push(point);
        this.chart.update();
    }
}




function generateGraphParameters(){
    const pairs = [
        [0, 1],
        [0, 2],
        [0, 3],
        [0, 4],
        [0, 5],
        [0, 11],
        [6, 11],
        [6, 7],
        [6, 8],
        [6, 9],
        [6, 10],
        [12, 11],
        [12, 13],
        [12, 14],
        [12, 15],
        [14, 15],
        [16, 0],
        [16, 17],
        [16, 18],
        [17, 18],
        [19, 18],
        [16, 19],
        [19, 17],
    ]
    const N_VERTEX = Math.max(...pairs.flat(Infinity)) - Math.min(...pairs.flat(Infinity)) + 1
    const _adjMatrix = Array.from({length: N_VERTEX}).map(_ => {
        return Array.from({length: N_VERTEX}).map(_ => 0)
    })
    for(p of pairs){
       _adjMatrix[p[0]][p[1]] = _adjMatrix[p[1]][p[0]] = 1
    }
    for(let i = 0; i < N_VERTEX; i++){
        for(let j = i; j < N_VERTEX; j++){
            if(i == j) _adjMatrix[i][j] = 1
            else _adjMatrix[i][j] = _adjMatrix[j][i]
        }
    }
    let positions = _adjMatrix.map(_ => [Math.random() - 0.5,Math.random()  - 0.5])
    return [_adjMatrix, positions]
}





var graph = null;
var chart = null;






(() => {
    /**
     * Initialize canvas
     */
    const canvasScale = 5
    const canvas = document.querySelector("#canvas");
    const c = canvas.getContext('2d');
    canvas.width = window.innerWidth * canvasScale;
    canvas.height = window.innerHeight * canvasScale;
    canvas.style.width = window.innerWidth+"px";
    canvas.style.height = window.innerHeight+"px";
    c.translate(canvas.width/2,canvas.height/2);
    c.strokeStyle = "#000"
    c.fillStyle = "#111"

    /**
     * Initialize global objects
     */
    graph = new Graph({width: canvas.width, height:canvas.height}, ...generateGraphParameters())
    chart = new LineChart(document.getElementById('loss').getContext('2d'), "Loss of the system");
    
    /**
     * Setup drag events
     */
    canvas.addEventListener('mousedown', function(event) {
        graph.startDragging({
            x: (event.pageX - canvas.offsetLeft - window.innerWidth/2) * canvasScale,
            y: (event.pageY - canvas.offsetTop - window.innerHeight/2) * canvasScale
        })
    })

    canvas.addEventListener('mousemove', function(event) {
        graph.dragTo({
            x: (event.pageX - canvas.offsetLeft - window.innerWidth/2) * canvasScale,
            y: (event.pageY - canvas.offsetTop - window.innerHeight/2) * canvasScale
        })
    })
    canvas.addEventListener('mouseup', function(event) {
        graph.stopDragging()
    })

    /**
     * Setup loss graph update
     */
    setInterval(()=>{
        chart.addPoint(graph.loss())
    }, 300)


    /**
     * Setup the draw loop
     */
    function animate(){
        requestAnimationFrame(animate)
        c.clearRect(-canvas.width, -canvas.height, canvas.width*2, canvas.height*2)
        graph.updatePositions()
        const scaledPos = graph.scaledPositions()
        const adjMatrix = graph.getAdjMatrix()
        for(let i = 0; i < scaledPos.length; i++){
            for(let j = i; j < scaledPos.length; j++){
                if(adjMatrix[i][j]){
                    c.strokeStyle = i == graph.currentDraggedId() || j == graph.currentDraggedId() ? "red" : "black"
                    c.beginPath()
                    c.moveTo(scaledPos[i][0], scaledPos[i][1])
                    c.lineTo(scaledPos[j][0], scaledPos[j][1])
                    c.stroke()
                    c.closePath()
                }
            }
        }
        for(let i = 0; i < adjMatrix.length; i++){ 
            c.beginPath()
            c.fillStyle = i == graph.currentDraggedId()  ? "red" : "black"
            c.arc(scaledPos[i][0], scaledPos[i][1], 10 + 10 * adjMatrix[i].reduce((a,b) => a+b), 0, Math.PI * 2, false)
            c.fill()
            c.stroke()
            c.closePath()
        }
    }
    animate()  

})()