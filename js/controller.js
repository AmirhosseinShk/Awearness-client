/*   Attack Path Controller
 *   @param $scope
 *   @param $http
 *   @param myConfig
 *
 *   Retrieve attack path from server whit GET request.
 */

routeAppControllers.controller('attackPathController', function ($scope, $http, myConfig, serviceTest) {

    var defaultPath = {
        ID: 0,
        Value: 1
    };

    // Defautl view : logical
    $scope.view = {
        status: "Logical"
    };
    $scope.valueGauge = 0;

    // Function available in $scope, to begin the procedure
    $scope.init = function () {

        $http.get(myConfig.url + "/host/list")
            .then(function (host) {
                $scope.listHosts = host.data;
            }, function () {
                alert("Loading of host list failed.")
            });

        // Request the number of path
        var number = $http.get(myConfig.url + "/attack_path/number")
            .then(function (valNumber) {
                $scope.items = valNumber.data;

                $scope.tab = [];

                for (var i = 1; i <= $scope.items.number; ++i) {
                    $scope.tab[i - 1] = {
                        "ID": i - 1,
                        "Value": i
                    };
                }

                var graph = $http.get(myConfig.url + "/attack_graph")
                    .then(function (valGraph) {

                        $scope.attack_graph = transformGraph(valGraph.data);

                        $scope.valSelecter = $scope.tab[defaultPath.ID];
                        $scope.appel(defaultPath);
                    }, function () {
                        alert("خطا در بارگزاری گراف حمله")
                    })
            }, function () {
                alert("خطا در بارگزاری مسیر حمله")
            })
    };

    $scope.appel = function (numb) {

        $http.get(myConfig.url + "/attack_path/" + numb.ID)
            .then(function (graph) {
                var pathGraph = transformPath(graph.data, $scope.attack_graph);
                console.log(pathGraph);
                $scope.graphes = pathGraph;
            }, function () {
                alert("خطا در بارگزاری مسیر حمله شماره" + numb.ID)
            })
    };



});

// ****************************************************

/**
 *   Gauge Controller
 *   @param $scope
 *
 *   Initialize data from gauge
 */
routeAppControllers.controller("RadialGaugeDemoCtrl", function ($scope) {

    $scope.value = $scope.valueGauge;
    $scope.upperLimit = 100;
    $scope.lowerLimit = 0;
    $scope.unit = "";
    $scope.precision = 1;
    $scope.ranges = [
        {
            min: 0,
            max: 20,
            color: '#008000'
        },
        {
            min: 20,
            max: 40,
            color: '#FFFF00'
        },
        {
            min: 40,
            max: 60,
            color: '#FFA500'
        },
        {
            min: 60,
            max: 80,
            color: '#FF0000'
        },
        {
            min: 80,
            max: 100,
            color: '#000000'
        }
    ];
});


// ****************************************************

/**
 *   Attack Graph Controller
 *   @param $scope
 *   @param $http
 *   @param myConfig
 *
 *   Retrieve data from server
 */
routeAppControllers.controller('attackGraphController', function ($scope, $http, myConfig) {

    $scope.view = {
        status: "Topological"
    };

    $scope.init = function () {

        $http.get(myConfig.url + "/attack_path/number")
            .then(function (valNumber) {
                $scope.items = valNumber.data;

                var list = $http.get(myConfig.url + "/attack_path/list")
                    .then(function (valList) {
                        $scope.tab = valList.data;
                    }, function () {
                        alert("خطا در بارگزاری مسیر حمله")
                    });

                var graph = $http.get(myConfig.url + "/attack_graph")
                    .then(function (valGraph) {
                        $scope.graphes = transformGraph(valGraph.data);
                    }, function () {
                        alert("خطا در بارگزاری مسیر حمله")
                    })
            }, function () {
                alert("خطا در بارگزاری مسیر حمله")
            })
    };
});


// ****************************************************

/**
 *   Attack Graph Topological Controller
 *   @param $scope
 *   @param $http
 *   @param myConfig
 *
 *   Retrieve data from server
 */
routeAppControllers.controller('attackGraphTopologicalController', function ($scope, $http, myConfig) {

    $scope.init = function () {

        var topological = $http.get(myConfig.url + "/attack_graph/topological")
            .then(function (data) {
                console.log(data);
                $scope.graphes = transformGraphTopo(data.data);
            }, function () {
                alert("خطا در بارگزاری گراف حمله")
            })
    };
});


// ****************************************************

/**
 *   Attack Path Topological Controller
 *   @param $scope
 *   @param $http
 *   @param myConfig
 *
 *   Retrieve data from server
 */
routeAppControllers.controller('attackPathTopologicalController', function ($scope, $http, myConfig) {

    $scope.view = {
        status: "Logical"
    };

    $scope.init = function () {

        var number = $http.get(myConfig.url + "/attack_path/number")
            .then(function (valNumber) {
                var numberPath = valNumber.data;

                // Array of value for the list
                $scope.tab = [];

                // Fill the tab with ID and Values
                for (var i = 1; i <= numberPath.number; ++i) {
                    $scope.tab[i - 1] = {
                        "ID": i - 1,
                        "Value": i
                    };
                }

                $http.get(myConfig.url + "/attack_graph")
                    .then(function (attackGraph) {
                        $scope.attack_graph = transformGraph(attackGraph.data);
                        var defaultPath = 0;
                        var topological = $http.get(myConfig.url + "/attack_path/" + defaultPath + "/topological")
                            .then(function (data) {
                                $scope.callTopoGraph($scope.valSelecter.ID);
                                // Default value in selecter
                                $scope.valSelecter = $scope.tab[0];
                            }, function () {
                                alert("خطا در بارگزاری گراف حمله")
                            })
                    }, function () {
                        alert("خطا در بارگزاری گراف حمله")
                    })
            }, function () {
                alert("خطا در بارگزاری گراف حمله")
            })
    };

    $scope.callTopoGraph = function (value) {
        $http.get(myConfig.url + "/attack_path/" + value + "/topological")
            .then(function (graphTopo) {
                $scope.graphes = transformPathTopo(graphTopo.data, $scope.attack_graph);
            }, function () {
                alert("Loading of a topological attack path failed.")
            })
    }
});

// ****************************************************
/**
 *   Topology Controller
 *   @param $scope
 *   @param $document
 *   @param rootScope
 *   @param FileUploader
 *   @param myConfig
 *   get inputs from user for design attackGraph
 */

routeAppControllers.controller('topologyController', function ($scope, $document, $rootScope, FileUploader, myConfig, $http) {
    //initialize headers
    hosts = ["نام قطعه", "نام رابط", "آدرس آیپی", "اتصال به نت", "میزان اهمیت"];
    networkfirewall = ["مبدا", "مقصد", "پورت مبدا", "پورت مقصد", "پروتکل"];
    routing = ["نام قطعه", "مقصد", "Netmask", "درگاه", "رابط"];
    vlans = ["نام", "آدرس", "رنج آیپی نهایی", "درگاه"];
    hostsRecords = [];
    vlansRecords = [];
    firewallRecords = [];
    routingRecords = [];

    var hideContextMenu = function () {
        $scope.isContextMenuVisible = false;
        if (!$rootScope.$$phase) {
            $rootScope.$apply();
        }
    };

    $scope.numRows = 0;
    $scope.numColumns = 0;
    records = [];
    devices = ["linux-1" , "linux-2"];
    headers = hosts;
    $scope.isContextMenuVisible = false;
    $scope.contextmenuRowIndex = -1;
    $scope.contextmenuColumnIndex = -1;

    $scope.ExportCSV = function () {
        var isHost = false;
        var hostDevices = [];
        // save information
        switch ($scope.item) {
            case "hosts":
                hostsRecords = records.slice();
                console.log("heeereee");
                isHost = true;
                break;
            case "vlans":
                vlansRecords = records.slice();
                break;
            case "routing":
                firewallRecords = records.slice();
                break;
            case "network-firewall":
                routingRecords = records.slice();
                break;
        };
        var csvString = $scope.item + "\n";
        for (var i = 0; i < records.length; i++) {
            var rowData = records[i];
            if(isHost){
                hostDevices.push(rowData[0]);
            }
            for (var j = 0; j < rowData.length; j++) {
                csvString = csvString + rowData[j].value + ",";
            }
            csvString = csvString.substring(0, csvString.length - 1);
            csvString = csvString + "\n";
        }
        csvString = csvString.substring(0, csvString.length - 1);
        console.log(csvString);
        setDeviceTools(hostDevices);
        callInitilizeService(csvString);
    };
    
    function setDeviceTools(data){
        console.log(data);
        devices = data.slice();
    }

    function callInitilizeService(data) {
        var sendData = $http.post(myConfig.url + "/initializeData", data)
            .then(function (response) {
                console.log(response);
            }, function (response) {
                console.log(response);
            });
        console.log(sendData);
    };

    $scope.getrecords = function () {
        return records;
    };

    $scope.getheaders = function () {
        return headers;
    };

    $scope.informationChange = function () {
        switch ($scope.item) {
            case "hosts":
                headers = hosts;
                if (hostsRecords.length > 0)
                    records = hostsRecords;
                break;
            case "vlans":
                headers = vlans;
                if (vlansRecords.length > 0)
                    records = vlansRecords;
                break;
            case "routing":
                headers = routing;
                if (routingRecords.length > 0)
                    records = routingRecords;
                break;
            case "network-firewall":
                headers = networkfirewall;
                if (firewallRecords.length > 0)
                    records = firewallRecords;
                break;
            default:
                headers = hosts;
                break;
        };
        $scope.init();
        switch ($scope.item) {
            case "hosts":
                if (hostsRecords.length > 0)
                    records = hostsRecords;
                break;
            case "vlans":
                if (vlansRecords.length > 0)
                    records = vlansRecords;
                break;
            case "routing":
                if (routingRecords.length > 0)
                    records = routingRecords;
                break;
            case "network-firewall":
                if (firewallRecords.length > 0)
                    records = firewallRecords;
                break;
        };
    };

    $scope.openContextMenu = function ($event, rowIndex, columnIndex) {
        $event.preventDefault();

        if ($event.button === 0) {
            $scope.isContextMenuVisible = false;
            return;
        }

        $scope.contextmenuRowIndex = rowIndex;
        $scope.contextmenuColumnIndex = columnIndex;
        $scope.isContextMenuVisible = true;
    };

    $scope.addRow = function () {
        var i,
            record,
            cell,
            index = $scope.contextmenuRowIndex;

        record = [];
        for (i = 0; i < $scope.numColumns; i++) {
            cell = {
                value: ''
            }
            record.push(cell);
        }

        records.push(record);
        $scope.isContextMenuVisible = false;
        $scope.numRows = records.length;
    };

    $scope.removeRow = function () {
        var index = $scope.contextmenuRowIndex;
        records.splice(index, 1);
        $scope.isContextMenuVisible = false;
        $scope.numRows = records.length;
    };

    // ************* SelectOptGroupController *************
    $scope.selectedToppings = [];
    $scope.printSelectedToppings = function printSelectedToppings() {
        var numberOfToppings = this.selectedToppings.length;

        // If there is more than one topping, we add an 'and'
        // to be gramatically correct. If there are 3+ toppings
        // we also add an oxford comma.
        if (numberOfToppings > 1) {
            var needsOxfordComma = numberOfToppings > 2;
            var lastToppingConjunction = (needsOxfordComma ? ',' : '') + ' and ';
            var lastTopping = lastToppingConjunction +
                this.selectedToppings[this.selectedToppings.length - 1];
            return this.selectedToppings.slice(0, -1).join(', ') + lastTopping;
        }
        return this.selectedToppings.join('');
    };
    
    $scope.getDevices = function () {
        return devices;
    };
    //************* call Test Product ***********
    $scope.callInitilizeTestService = function() {
     var callTest = $http.get(myConfig.url + "/initializeTest")
            .then(function (response) {
                console.log(response);
            }, function (response) {
                console.log(response);
            });
        console.log(callTest);
    };
    // ************ init Scope ******************
    $scope.init = function () {
        var i, j, column, cell;
        var recordstemp = [],
            record;
        $scope.numRows = 2;
        $scope.numColumns = headers.length;
        for (i = 0; i < $scope.numRows; i++) {
            record = [];
            for (j = 0; j < $scope.numColumns; j++) {
                cell = {
                    value: ''
                }
                record.push(cell);
            }
            recordstemp.push(record);
        }
        records = recordstemp;
    }
    $scope.init();


    // **************** File Uploader **************
    var uploader = $scope.uploader = new FileUploader({
        url: myConfig.url + "/initializeNessus",
        withCfentials: true
    });

    // Callbaks
    uploader.onAfterAddingFile = function (fileItem) {
        console.info('onAfterAddingFile', fileItem);
    };
    uploader.onBeforeUploadItem = function (item) {
        console.info('onBeforeUploadItem', item);
    };
    uploader.onProgressItem = function (fileItem, progress) {
        console.info('onProgressItem', fileItem, progress);
    };
    uploader.onProgressAll = function (progress) {
        console.info('onProgressAll', progress);
    };
    uploader.onSuccessItem = function (fileItem, response, status, headers) {
        console.info('onSuccessItem', fileItem, response, status, headers);
    };
    uploader.onErrorItem = function (fileItem, response, status, headers) {
        console.info('onErrorItem', fileItem, response, status, headers);
        alert("مشکلی در ایجاد گراف حمله وجود دارد.آدرس را بررسی نمایید\n " + myConfig.url + "/initialize");
    };
    uploader.onCancelItem = function (fileItem, response, status, headers) {
        console.info('onCancelItem', fileItem, response, status, headers);
    };
    uploader.onCompleteItem = function (fileItem, response, status, headers) {
        console.info('onCompleteItem', fileItem, response, status, headers);
    };
    uploader.onCompleteAll = function () {
        console.info('onCompleteAll');
        $scope.show = true;
        //   alert("گراف حمله ایجاد شد و آماده آنالیز میباشد.");
    };
});

/*
	//about topology Drawing

      var $ = go.GraphObject.make;  // for conciseness in defining templates		
      componentDigaram = $(go.Diagram, "ComponentDiv");
      myDiagram = $(go.Diagram, "DiagramDiv");

      // conversion functions for Bindings in the Node template:

      function nodeTypeImage(type) {
        switch (type) {                                         // Image sizes
          case "S2": return "../img/voice atm switch.jpg";      // 55x55
          case "S3": return "../img/server switch.jpg";         // 55x55
          case "P1": return "../img/general processor.jpg";     // 60x85
          case "P2": return "../img/storage array.jpg";         // 55x80
          case "M4": return "../img/iptv broadcast server.jpg"; // 80x50
          case "M5": return "../img/content engine.jpg";        // 90x65
          case "I1": return "../img/pc.jpg";                    // 80x70
          default: return "../img/pc.jpg";                      // 80x70
        }
      }

      function nodeTypeSize(type) {
        switch (type) {
          case "S2": return new go.Size(55, 55);
          case "S3": return new go.Size(55, 55);
          case "P1": return new go.Size(60, 85);
          case "P2": return new go.Size(55, 80);
          case "M4": return new go.Size(80, 50);
          case "M5": return new go.Size(90, 65);
          case "I1": return new go.Size(80, 70);
          default: return new go.Size(80, 70);
        }
      } 
      
     // install custom linking tool, defined in PolylineLinkingTool.js
      var tool = new PolylineLinkingTool();
      //tool.temporaryLink.routing = go.Link.Orthogonal;  // optional, but need to keep link template in sync, below
      myDiagram.toolManager.linkingTool = tool;

      myDiagram.nodeTemplate =
        $(go.Node, "Auto",
          { locationSpot: go.Spot.Center },
	  { locationObjectName: "ICON" },
          new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
          $(go.Shape,
            {
              portId: "", cursor: "pointer",
              fromLinkable: true,
              //fromLinkableSelfNode: true, fromLinkableDuplicates: true,  // optional
              toLinkable: true,
             // toLinkableSelfNode: true, toLinkableDuplicates: true  // optional
            },
            new go.Binding("fill")),

          $(go.Panel, "Spot",
            $(go.Panel, "Vertical",
              { name: "ICON" },
              $(go.Picture,
                { margin: 5 },
                new go.Binding("source", "type", nodeTypeImage),
                new go.Binding("desiredSize", "type", nodeTypeSize)),
		$(go.TextBlock,
	            new go.Binding("text"))
            ),
          ),
        );  // end Node

      myDiagram.linkTemplate =
        $(go.Link,
          { reshapable: true, resegmentable: true },
          //{ routing: go.Link.Orthogonal },  // optional, but need to keep LinkingTool.temporaryLink in sync, above
          { adjusting: go.Link.Stretch },  // optional
          new go.Binding("points", "points").makeTwoWay(),
          $(go.Shape, { strokeWidth: 1.5 }),
          $(go.Shape, { toArrow: "OpenTriangle" }));
		
		
	  componentDigaram.nodeTemplate = $(go.Node, "Vertical",
          {
            movable: false,
            copyable: true,
            deletable: false,
            locationSpot: go.Spot.Center
          } , 
	  {locationObjectName: "ICON" },
          new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
          $(go.Panel, "Spot",
            $(go.Panel, "Auto",
              { name: "ICON" },
              $(go.Picture,
                { margin: 5 },
                new go.Binding("source", "type", nodeTypeImage),
                new go.Binding("desiredSize", "type", nodeTypeSize)),
            ),  // end Auto Panel
          ),  // end Spot Panel
          $(go.TextBlock,
            new go.Binding("text")),
          );
		  
	  components = { "class": "go.GraphLinksModel",
		"nodeDataArray": [
		{"key":"1", "text":"Router", "type":"S2", "loc":"255 150"},
		{"key":"2", "text":"Switch", "type":"S3", "loc":"255 250"},
		{"key":"3", "text":"Machine", "type":"I1", "loc":"255 350"} ],
		};	
		
	  componentDigaram.model = go.Model.fromJson(components);
	  componentDigaram.toolManager.panningTool.isEnabled = false;  */
